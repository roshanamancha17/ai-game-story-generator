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

export async function generateGameStory(input: StoryInput): Promise<StoryOutput> {
  try {
    const response = await openai.chat.completions.create({
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

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error generating story:', error);
    throw new Error('Failed to generate story');
  }
}
