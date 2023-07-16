import { z } from "./deps.ts";

export const User = z.object({
  id: z.string().uuid().describe("primary"),
  createdAt: z.date(),
  name: z.string(),
});

export const Order = z.object({
  id: z.string().uuid().describe("primary"),
  createdAt: z.date(),
  name: z.string(),
  userId: z.string().uuid(),
});

export const Post = z.object({
  id: z.string().uuid().describe("primary"),
  createdAt: z.date(),
  title: z.string(),
});

export const Category = z.object({
  id: z.string().uuid().describe("primary"),
  createdAt: z.date(),
  name: z.string(),
});
