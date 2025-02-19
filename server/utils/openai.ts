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

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let retries = 0;
  let delay = initialDelayMs;

  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      if (error.status !== 429 || retries >= maxRetries) {
        throw error;
      }

      retries++;
      console.log(`Rate limited. Retrying in ${delay}ms... (Attempt ${retries} of ${maxRetries})`);
      await sleep(delay);
      delay *= 2; // Exponential backoff
    }
  }
}

export async function generateGameStory(input: StoryInput): Promise<StoryOutput> {
  try {
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
      throw new Error('The AI service is currently busy. Please try again in a few minutes. We automatically retry your request a few times before showing this message.');
    }

    if (error.status === 401) {
      throw new Error('Invalid API key. Please check your OpenAI API key configuration.');
    }

    if (error.status === 500) {
      throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
    }

    throw new Error('Failed to generate story. Please try again.');
  }
}