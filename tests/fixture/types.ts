import { TableDefinition } from "pentagon/src/types.ts";
import { z } from "z";

export const User = z.object({
  id: z.string().uuid().describe("primary"),
  createdAt: z.coerce.date(),
  name: z.string(),
});

export const Order = z.object({
  id: z.string().uuid().describe("primary"),
  createdAt: z.coerce.date(),
  name: z.string(),
  userId: z.string().uuid(),
});

export const Post = z.object({
  id: z.string().uuid().describe("primary"),
  createdAt: z.coerce.date(),
  title: z.string(),
});

export const Category = z.object({
  id: z.string().uuid().describe("primary"),
  createdAt: z.coerce.date(),
  name: z.string(),
});

export const schema: Record<string, TableDefinition> = {
  users: {
    schema: User,
    relations: {
      myOrders: ["orders", [Order], "id", "userId"],
      myPosts: ["posts", [Post], "id", "userId"],
    },
  },
  orders: {
    schema: Order,
    relations: {
      user: ["users", User, "userId", "id"],
    },
  },
  posts: {
    schema: Post,
    relations: {
      user: ["users", User, "userId", "id"],
    },
  },
};
