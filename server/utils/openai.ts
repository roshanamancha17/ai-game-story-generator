// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
import OpenAI from "openai";
import { StoryGenre, StoryLength } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface StoryInput {
  genre: StoryGenre;
  gameTitle: string;
  mainCharacter: string;
  storyLength: StoryLength;
}

interface StoryOutput {
  title: string;
  introduction: string;
  mainQuest: string;
  sideQuests: string[];
  characters: Array<{
    name: string;
    role: string;
    description: string;
  }>;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Circuit breaker state
let consecutiveFailures = 0;
const FAILURE_THRESHOLD = 3;
const CIRCUIT_RESET_TIMEOUT = 60000; // 1 minute
let circuitBreakerTimer: NodeJS.Timeout | null = null;

function resetCircuitBreaker() {
  consecutiveFailures = 0;
  if (circuitBreakerTimer) {
    clearTimeout(circuitBreakerTimer);
    circuitBreakerTimer = null;
  }
}

function isCircuitOpen() {
  return consecutiveFailures >= FAILURE_THRESHOLD;
}

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  if (isCircuitOpen()) {
    throw new Error('Service temporarily unavailable. Please try again in a minute.');
  }

  let retries = 0;
  let delay = initialDelayMs;

  while (true) {
    try {
      const result = await operation();
      resetCircuitBreaker();
      return result;
    } catch (error: any) {
      if (error.status !== 429 || retries >= maxRetries) {
        consecutiveFailures++;

        if (consecutiveFailures >= FAILURE_THRESHOLD && !circuitBreakerTimer) {
          circuitBreakerTimer = setTimeout(() => {
            resetCircuitBreaker();
          }, CIRCUIT_RESET_TIMEOUT);
        }

        throw error;
      }

      retries++;
      console.log(`Rate limited. Retrying in ${delay}ms... (Attempt ${retries} of ${maxRetries})`);
      await sleep(delay);
      delay *= 2; // Exponential backoff
    }
  }
}

// Simple rate limiter using a Map
const requestTimes = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const userRequests = requestTimes.get(userId) || [];

  // Remove old requests outside the window
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  requestTimes.set(userId, recentRequests);

  return recentRequests.length >= MAX_REQUESTS_PER_WINDOW;
}

function addRequest(userId: string) {
  const userRequests = requestTimes.get(userId) || [];
  userRequests.push(Date.now());
  requestTimes.set(userId, userRequests);
}

// Fallback story generator for when OpenAI is unavailable
function generateFallbackStory(input: StoryInput): StoryOutput {
  return {
    title: input.gameTitle,
    introduction: `A ${input.genre.toLowerCase()} story featuring ${input.mainCharacter}. (Story generation is temporarily unavailable. Please try again later.)`,
    mainQuest: "Main quest will be generated when the service is available again.",
    sideQuests: ["Side quests will be generated when the service is available again."],
    characters: [{
      name: input.mainCharacter,
      role: "Protagonist",
      description: "Character details will be generated when the service is available again."
    }]
  };
}

export async function generateGameStory(input: StoryInput, userId: string): Promise<StoryOutput> {
  try {
    if (isRateLimited(userId)) {
      throw new Error('You have reached the maximum number of story generations per minute. Please wait a moment and try again.');
    }

    addRequest(userId);

    const response = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a creative game story writer who specializes in creating engaging game narratives."
          },
          {
            role: "user",
            content: `Create a ${input.storyLength.toLowerCase()} game story with the following details:
            Genre: ${input.genre}
            Game Title: ${input.gameTitle}
            Main Character: ${input.mainCharacter}

            Format the response as a JSON object with the following structure:
            {
              "title": "Game title",
              "introduction": "Story introduction",
              "mainQuest": "Main quest description",
              "sideQuests": ["Side quest 1", "Side quest 2"],
              "characters": [{
                "name": "Character name",
                "role": "Character role",
                "description": "Character description"
              }]
            }`
          }
        ],
        response_format: { type: "json_object" }
      });
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    return JSON.parse(content) as StoryOutput;
  } catch (error: any) {
    console.error('Error generating story:', error);

    if (error.status === 429) {
      if (isCircuitOpen()) {
        console.log('Circuit breaker active, using fallback response');
        return generateFallbackStory(input);
      }
      throw new Error('The AI service is temporarily at capacity. Please wait a minute before trying again. We automatically retry your request a few times before showing this message.');
    }

    if (error.status === 401) {
      throw new Error('Invalid API key. Please check your OpenAI API key configuration.');
    }

    if (error.status === 500) {
      return generateFallbackStory(input);
    }

    // Pass through custom rate limit message
    if (error.message.includes('reached the maximum number')) {
      throw error;
    }

    // For any other errors, use the fallback
    console.log('Unexpected error, using fallback response');
    return generateFallbackStory(input);
  }
}