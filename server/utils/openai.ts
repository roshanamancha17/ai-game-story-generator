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

interface IdeaGenerationInput {
  description: string;
}

interface IdeaGenerationOutput {
  genre: StoryGenre;
  gameTitle: string;
  mainCharacter: string;
  storyLength: StoryLength;
  conceptDescription: string;
}

interface PromptImprovementOutput {
  improvedPrompt: string;
  reasoning: string;
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

        if (error.status === 429) {
          throw new Error('Too many requests. Please try again in a moment.');
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
  const genreElements = {
    Fantasy: {
      setting: "mystical realm",
      antagonist: "dark sorcerer",
      items: ["ancient magical artifact", "enchanted weapon", "mystical map"],
      challenges: ["ancient curse", "magical barrier", "dragon's lair"]
    },
    "Sci-Fi": {
      setting: "distant space colony",
      antagonist: "rogue AI",
      items: ["advanced technology", "quantum device", "alien artifact"],
      challenges: ["system malfunction", "hostile aliens", "time paradox"]
    },
    Horror: {
      setting: "abandoned facility",
      antagonist: "supernatural entity",
      items: ["mysterious journal", "ritual components", "ancient relic"],
      challenges: ["psychological terror", "survival", "dark rituals"]
    },
    Mystery: {
      setting: "noir city",
      antagonist: "hidden mastermind",
      items: ["crucial evidence", "secret documents", "mysterious key"],
      challenges: ["complex conspiracies", "false leads", "time pressure"]
    },
    RPG: {
      setting: "vast open world",
      antagonist: "legendary warrior",
      items: ["legendary equipment", "rare resources", "ancient scrolls"],
      challenges: ["epic battles", "skill trials", "moral choices"]
    }
  };

  const elements = genreElements[input.genre];
  const introLength = input.storyLength === "Short" ? "brief" : input.storyLength === "Long" ? "epic" : "compelling";

  const story: StoryOutput = {
    title: input.gameTitle,
    introduction: `In the ${elements.setting} of ${input.gameTitle}, a ${introLength} tale unfolds. ${input.mainCharacter} emerges as an unlikely hero, destined to face the challenges that threaten this world. As darkness looms and the ${elements.antagonist} grows in power, our hero must rise to meet their destiny.`,
    mainQuest: `Defeat the ${elements.antagonist} who threatens to destroy the ${elements.setting}. Gather the ${elements.items[0]} and master its power before it's too late.`,
    sideQuests: [
      `Explore the ${elements.setting} to find the legendary ${elements.items[1]}.`,
      `Help the local inhabitants overcome the ${elements.challenges[0]}.`,
      `Investigate the mystery of the ${elements.items[2]} and its connection to the ${elements.antagonist}.`
    ],
    characters: [
      {
        name: input.mainCharacter,
        role: "Protagonist",
        description: `A determined hero who must overcome their limitations to save the ${elements.setting}. Armed with courage and destiny, they face the greatest challenges of their life.`
      },
      {
        name: `Guardian of the ${elements.items[0]}`,
        role: "Mentor",
        description: `An enigmatic figure who guides the hero in their quest to master the power of the ${elements.items[0]}.`
      },
      {
        name: `The ${elements.antagonist}`,
        role: "Antagonist",
        description: `A powerful force of evil threatening to unleash chaos upon the ${elements.setting}. Their mastery of ${elements.challenges[1]} makes them a formidable opponent.`
      }
    ]
  };

  return story;
}

function generateFallbackIdea(input: IdeaGenerationInput): IdeaGenerationOutput {
  const keywords = input.description.toLowerCase();
  let genre: StoryGenre = "Fantasy";

  if (keywords.includes("space") || keywords.includes("future") || keywords.includes("technology")) {
    genre = "Sci-Fi";
  } else if (keywords.includes("horror") || keywords.includes("scary") || keywords.includes("dark")) {
    genre = "Horror";
  } else if (keywords.includes("detective") || keywords.includes("solve") || keywords.includes("mystery")) {
    genre = "Mystery";
  } else if (keywords.includes("role") || keywords.includes("adventure") || keywords.includes("quest")) {
    genre = "RPG";
  }

  return {
    genre,
    gameTitle: input.description.split(' ').slice(0, 3).join(' '),
    mainCharacter: "A mysterious protagonist",
    storyLength: "Medium",
    conceptDescription: input.description
  };
}

async function generateImprovedPrompt(input: IdeaGenerationInput, userId: string): Promise<PromptImprovementOutput> {
  try {
    if (isRateLimited(userId)) {
      throw new Error('Please wait a moment before making another request.');
    }

    if (isCircuitOpen()) {
      return {
        improvedPrompt: input.description,
        reasoning: "Our AI assistant is taking a short break. Please try again in a minute."
      };
    }

    addRequest(userId);

    const response = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert at improving game concept descriptions to generate better game ideas. Help refine the user's input to include more specific details and creative elements."
          },
          {
            role: "user",
            content: `Improve this game concept description to include more specific details about gameplay, setting, and unique features:
            "${input.description}"

            Format the response as a JSON object with the following structure:
            {
              "improvedPrompt": "The improved description with more details",
              "reasoning": "Brief explanation of what was added/changed and why"
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

    return JSON.parse(content) as PromptImprovementOutput;
  } catch (error: any) {
    console.error('Error improving prompt:', error);

    if (error.status === 429) {
      throw new Error('Please wait a moment before making another request.');
    }

    if (error.status === 401) {
      throw new Error('OpenAI service is currently unavailable. Please try again later.');
    }

    return {
      improvedPrompt: input.description,
      reasoning: "We couldn't improve your prompt right now. Please try again in a moment."
    };
  }
}

async function generateGameIdea(input: IdeaGenerationInput, userId: string): Promise<IdeaGenerationOutput> {
  try {
    if (isRateLimited(userId)) {
      throw new Error('Please wait a moment before generating another idea.');
    }

    if (isCircuitOpen()) {
      return generateFallbackIdea(input);
    }

    addRequest(userId);

    const response = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a creative game designer who helps transform text descriptions into structured game concepts."
          },
          {
            role: "user",
            content: `Transform this description into a game concept:
            "${input.description}"

            Format the response as a JSON object with the following structure:
            {
              "genre": one of ["Fantasy", "Sci-Fi", "Horror", "Mystery", "RPG"],
              "gameTitle": "A catchy title for the game",
              "mainCharacter": "Description of the main character",
              "storyLength": one of ["Short", "Medium", "Long"],
              "conceptDescription": "A brief description of the core game concept"
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

    return JSON.parse(content) as IdeaGenerationOutput;
  } catch (error: any) {
    console.error('Error generating game idea:', error);

    if (error.status === 429) {
      throw new Error('Please wait a moment before generating another idea.');
    }

    if (error.status === 401) {
      throw new Error('OpenAI service is currently unavailable. Please try again later.');
    }

    console.log('Using fallback response for idea generation');
    const fallbackIdea = generateFallbackIdea(input);
    return {
      ...fallbackIdea,
      conceptDescription: fallbackIdea.conceptDescription + " (AI services will be available again shortly.)"
    };
  }
}

async function generateGameStory(input: StoryInput, userId: string): Promise<StoryOutput> {
  try {
    if (isRateLimited(userId)) {
      throw new Error('Please wait a moment before generating another story.');
    }

    if (isCircuitOpen()) {
      return generateFallbackStory(input);
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
      throw new Error('Please wait a moment before generating another story.');
    }

    if (error.status === 401) {
      throw new Error('OpenAI service is currently unavailable. Please try again later.');
    }

    return generateFallbackStory(input);
  }
}

export { generateGameStory, generateGameIdea, generateImprovedPrompt };