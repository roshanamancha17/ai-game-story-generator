import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  genre: text("genre").notNull(),
  gameTitle: text("game_title").notNull(),
  mainCharacter: text("main_character").notNull(),
  storyLength: text("story_length").notNull(),
  content: jsonb("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertStorySchema = createInsertSchema(stories).pick({
  userId: true,
  genre: true,
  gameTitle: true,
  mainCharacter: true,
  storyLength: true,
  content: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof stories.$inferSelect;

export const storyGenreSchema = z.enum([
  "Fantasy",
  "Sci-Fi", 
  "Horror",
  "Mystery",
  "RPG"
]);

export const storyLengthSchema = z.enum([
  "Short",
  "Medium",
  "Long"
]);

export type StoryGenre = z.infer<typeof storyGenreSchema>;
export type StoryLength = z.infer<typeof storyLengthSchema>;

// New schema for gameplay mechanics
export interface GameplayDetails {
  playerMovement: {
    basicControls: string[];
    specialMoves: string[];
    navigationMechanics: string;
  };
  coreMechanics: {
    mainGameplay: string;
    uniqueFeatures: string[];
    progression: string;
  };
  combatSystem?: {
    attackTypes: string[];
    defenseOptions: string[];
    specialAbilities: string[];
  };
  environmentInteraction: {
    interactiveElements: string[];
    environmentalMechanics: string;
    puzzleTypes?: string[];
  };
}