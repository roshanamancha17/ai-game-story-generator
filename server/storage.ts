import session from "express-session";
import createMemoryStore from "memorystore";
import { InsertUser, User, Story, InsertStory } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createStory(story: InsertStory): Promise<Story>;
  getStoriesByUserId(userId: number): Promise<Story[]>;
  updateUserPremium(userId: number, isPremium: boolean): Promise<void>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private stories: Map<number, Story>;
  private currentUserId: number;
  private currentStoryId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.stories = new Map();
    this.currentUserId = 1;
    this.currentStoryId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      isPremium: false,
      premiumUntil: null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPremium(userId: number, isPremium: boolean): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      const updatedUser: User = {
        ...user,
        isPremium,
        premiumUntil: isPremium ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null // 30 days from now
      };
      this.users.set(userId, updatedUser);
    }
  }

  async createStory(insertStory: InsertStory): Promise<Story> {
    const id = this.currentStoryId++;
    const story: Story = {
      ...insertStory,
      id,
      createdAt: new Date()
    };
    this.stories.set(id, story);
    return story;
  }

  async getStoriesByUserId(userId: number): Promise<Story[]> {
    return Array.from(this.stories.values())
      .filter(story => story.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();