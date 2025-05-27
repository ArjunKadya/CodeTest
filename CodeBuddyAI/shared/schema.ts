import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userStories = pgTable("user_stories", {
  id: serial("id").primaryKey(),
  projectType: text("project_type").notNull(),
  language: text("language").notNull(),
  story: text("story").notNull(),
  generatedCode: text("generated_code"),
  unitTests: text("unit_tests"),
  integrationTests: text("integration_tests"),
  e2eTests: text("e2e_tests"),
  penetrationTests: text("penetration_tests"),
  regressionTests: text("regression_tests"),
  nlpAnalysis: jsonb("nlp_analysis"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const generationJobs = pgTable("generation_jobs", {
  id: serial("id").primaryKey(),
  userStoryId: integer("user_story_id").references(() => userStories.id),
  jobType: text("job_type").notNull(), // 'code', 'unit_tests', 'integration_tests', etc.
  status: text("status").notNull().default("pending"), // 'pending', 'processing', 'completed', 'failed'
  result: text("result"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertUserStorySchema = createInsertSchema(userStories).pick({
  projectType: true,
  language: true,
  story: true,
});

export const insertGenerationJobSchema = createInsertSchema(generationJobs).pick({
  userStoryId: true,
  jobType: true,
});

export type InsertUserStory = z.infer<typeof insertUserStorySchema>;
export type UserStory = typeof userStories.$inferSelect;
export type InsertGenerationJob = z.infer<typeof insertGenerationJobSchema>;
export type GenerationJob = typeof generationJobs.$inferSelect;
