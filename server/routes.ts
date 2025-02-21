import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateGameStory, generateGameIdea, generateImprovedPrompt, generateGameplayDetails, generateWorldBuilding } from "./utils/openai";
import { z } from "zod";
import Stripe from "stripe";
import * as openai from 'openai'; //Import openai

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16"
});

const generateIdeaSchema = z.object({
  description: z.string().min(1, "Description is required").max(500, "Description too long")
});

const improvePromptSchema = z.object({
  description: z.string().min(1, "Description is required").max(500, "Description too long")
});

const genreRecommendationSchema = z.object({
  description: z.string().min(1, "Description is required").max(1000, "Description too long")
});

const storyGenreSchema = z.string().min(1, "Genre is required").max(50, "Genre too long"); //Added StoryGenreSchema

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.post("/api/recommend-genre", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { description } = genreRecommendationSchema.parse(req.body);

      // Call OpenAI to analyze the story and recommend a genre
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a game story genre analysis expert. Analyze the given story description and recommend the most suitable genre from the available options. Provide your response in JSON format with the following structure: { recommendedGenre: string, confidence: number, explanation: string, alternativeGenres: string[] }. The genre must be one of: Fantasy, Sci-Fi, Horror, Mystery, RPG. Confidence should be between 0 and 1."
          },
          {
            role: "user",
            content: description
          }
        ],
        response_format: { type: "json_object" }
      });

      const recommendation = JSON.parse(completion.choices[0].message.content);

      // Validate the recommended genre against our schema
      if (!storyGenreSchema.safeParse(recommendation.recommendedGenre).success) {
        throw new Error("Invalid genre recommendation received");
      }

      res.json(recommendation);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  });

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

      // If not premium, return limited world details
      if (!req.user.isPremium) {
        const limitedDetails = {
          worldName: worldDetails.worldName,
          environment: {
            geography: "A brief overview of the world's geography (Upgrade to premium for detailed descriptions)",
            climate: "Basic climate information (Upgrade to premium for detailed climate systems)",
            landmarks: [],
            settlements: []
          },
          cosmology: {
            origin: "A basic overview of the world (Upgrade to premium for complete world lore)",
            magicSystem: null,
            technology: null,
            naturalLaws: []
          },
          society: {
            factions: [],
            cultures: [],
            politics: {
              powerStructure: "",
              majorConflicts: [],
              alliances: []
            }
          },
          history: {
            timeline: [],
            legends: [],
            artifacts: []
          }
        };
        return res.json(limitedDetails);
      }

      res.json(worldDetails);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  });

  // Add this new endpoint near the other premium-related endpoints
  app.post("/api/enable-premium", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      await storage.updateUserPremium(req.user.id, true);

      // Get updated user data
      const user = await storage.getUser(req.user.id);
      res.json(user);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}