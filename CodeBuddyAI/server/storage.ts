import { userStories, generationJobs, type UserStory, type InsertUserStory, type GenerationJob, type InsertGenerationJob } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User Stories
  createUserStory(userStory: InsertUserStory): Promise<UserStory>;
  getUserStory(id: number): Promise<UserStory | undefined>;
  updateUserStory(id: number, updates: Partial<UserStory>): Promise<UserStory | undefined>;
  getAllUserStories(): Promise<UserStory[]>;
  
  // Generation Jobs
  createGenerationJob(job: InsertGenerationJob): Promise<GenerationJob>;
  getGenerationJob(id: number): Promise<GenerationJob | undefined>;
  updateGenerationJob(id: number, updates: Partial<GenerationJob>): Promise<GenerationJob | undefined>;
  getJobsByUserStoryId(userStoryId: number): Promise<GenerationJob[]>;
  getPendingJobs(): Promise<GenerationJob[]>;
}

export class DatabaseStorage implements IStorage {
  async createUserStory(insertUserStory: InsertUserStory): Promise<UserStory> {
    const [userStory] = await db
      .insert(userStories)
      .values(insertUserStory)
      .returning();
    return userStory;
  }

  async getUserStory(id: number): Promise<UserStory | undefined> {
    const [userStory] = await db.select().from(userStories).where(eq(userStories.id, id));
    return userStory || undefined;
  }

  async updateUserStory(id: number, updates: Partial<UserStory>): Promise<UserStory | undefined> {
    const [updated] = await db
      .update(userStories)
      .set(updates)
      .where(eq(userStories.id, id))
      .returning();
    return updated || undefined;
  }

  async getAllUserStories(): Promise<UserStory[]> {
    const stories = await db.select().from(userStories).orderBy(userStories.createdAt);
    return stories.reverse();
  }

  async createGenerationJob(insertJob: InsertGenerationJob): Promise<GenerationJob> {
    const [job] = await db
      .insert(generationJobs)
      .values(insertJob)
      .returning();
    return job;
  }

  async getGenerationJob(id: number): Promise<GenerationJob | undefined> {
    const [job] = await db.select().from(generationJobs).where(eq(generationJobs.id, id));
    return job || undefined;
  }

  async updateGenerationJob(id: number, updates: Partial<GenerationJob>): Promise<GenerationJob | undefined> {
    const [updated] = await db
      .update(generationJobs)
      .set(updates)
      .where(eq(generationJobs.id, id))
      .returning();
    return updated || undefined;
  }

  async getJobsByUserStoryId(userStoryId: number): Promise<GenerationJob[]> {
    const jobs = await db.select().from(generationJobs).where(eq(generationJobs.userStoryId, userStoryId));
    return jobs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getPendingJobs(): Promise<GenerationJob[]> {
    const jobs = await db.select().from(generationJobs);
    return jobs.filter(job => job.status === "pending" || job.status === "processing");
  }
}

export const storage = new DatabaseStorage();
