import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateGameStory, generateGameIdea } from "./utils/openai";
import { z } from "zod";

const generateIdeaSchema = z.object({
  description: z.string().min(1, "Description is required").max(500, "Description too long")
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.post("/api/generate-idea", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { description } = generateIdeaSchema.parse(req.body);

      const idea = await generateGameIdea({ description }, req.user.id.toString());
      res.json(idea);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/stories", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const story = await generateGameStory({
        genre: req.body.genre,
        gameTitle: req.body.gameTitle,
        mainCharacter: req.body.mainCharacter,
        storyLength: req.body.storyLength
      }, req.user.id.toString());

      const savedStory = await storage.createStory({
        userId: req.user.id,
        genre: req.body.genre,
        gameTitle: req.body.gameTitle,
        mainCharacter: req.body.mainCharacter,
        storyLength: req.body.storyLength,
        content: story
      });

      res.json(savedStory);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  });

  app.get("/api/stories", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const stories = await storage.getStoriesByUserId(req.user.id);
      res.json(stories);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}