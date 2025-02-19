import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { generateGameStory } from "./ai";
import { storage } from "./storage";
import { insertStorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.post("/api/generate-story", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(req.user.id);
    if (!user || user.storyCredits <= 0) {
      return res.status(402).json({ message: "No story credits remaining" });
    }

    const validatedInput = insertStorySchema.parse(req.body);
    const storyContent = await generateGameStory(validatedInput);
    
    await storage.decrementCredits(user.id);
    const story = await storage.createStory({
      userId: user.id,
      title: validatedInput.title,
      genre: validatedInput.genre,
      content: storyContent
    });

    res.json(story);
  });

  app.get("/api/stories", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const stories = await storage.getUserStories(req.user.id);
    res.json(stories);
  });

  const httpServer = createServer(app);
  return httpServer;
}
