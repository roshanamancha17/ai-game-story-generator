import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
export async function generateGameStory(input: {
  genre: string;
  title: string;
  mainCharacter: string;
  storyLength: string;
}): Promise<{
  introduction: string;
  mainQuest: string;
  sideQuests: string[];
  characters: { name: string; description: string }[];
}> {
  const prompt = `Generate a game story with the following parameters:
Genre: ${input.genre}
Title: ${input.title}
Main Character: ${input.mainCharacter}
Length: ${input.storyLength}

Return a JSON object with the following structure:
{
  "introduction": "Story introduction text",
  "mainQuest": "Main quest description",
  "sideQuests": ["Side quest 1", "Side quest 2", "Side quest 3"],
  "characters": [{"name": "Character name", "description": "Character description"}]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}
