import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateGameStory } from "./utils/openai";
import { insertStorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

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
      });

      const savedStory = await storage.createStory({
        userId: req.user.id,
        genre: req.body.genre,
        gameTitle: req.body.gameTitle,
        mainCharacter: req.body.mainCharacter,
        storyLength: req.body.storyLength,
        content: story
      });

      res.json(savedStory);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/stories", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const stories = await storage.getStoriesByUserId(req.user.id);
      res.json(stories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
