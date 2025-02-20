import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateGameStory, generateGameIdea, generateImprovedPrompt, generateGameplayDetails, generateWorldBuilding } from "./utils/openai";
import { z } from "zod";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16"
});

const generateIdeaSchema = z.object({
  description: z.string().min(1, "Description is required").max(500, "Description too long")
});

const improvePromptSchema = z.object({
  description: z.string().min(1, "Description is required").max(500, "Description too long")
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.post("/api/create-checkout", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Premium Subscription",
                description: "Access to premium game story generation features",
              },
              unit_amount: 999, // $9.99 in cents
              recurring: {
                interval: "month"
              }
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${req.protocol}://${req.get("host")}/?success=true`,
        cancel_url: `${req.protocol}://${req.get("host")}/premium?canceled=true`,
        client_reference_id: req.user.id.toString(),
      });

      res.json({ url: session.url });
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/webhook", async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret!);
    } catch (err: any) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = parseInt(session.client_reference_id!);

      // Update user's premium status
      await storage.updateUserPremium(userId, true);
    }

    res.json({ received: true });
  });

  app.post("/api/generate-idea", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { description } = generateIdeaSchema.parse(req.body);

      const idea = await generateGameIdea({ description }, req.user.id.toString(), req.user.isPremium);
      res.json(idea);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/improve-prompt", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { description } = improvePromptSchema.parse(req.body);

      const improved = await generateImprovedPrompt(
        { description }, 
        req.user.id.toString(),
        req.user.isPremium
      );
      res.json(improved);
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
      }, req.user.id.toString(), req.user.isPremium);

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

  app.post("/api/gameplay-details", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const gameplayDetails = await generateGameplayDetails(
        req.body, 
        req.user.id.toString(),
        req.user.isPremium
      );
      res.json(gameplayDetails);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/world-building", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const worldDetails = await generateWorldBuilding(
        req.body,
        req.user.id.toString(),
        req.user.isPremium
      );
      res.json(worldDetails);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}