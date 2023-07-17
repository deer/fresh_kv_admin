import { TableDefinition } from "pentagon/src/types.ts";
import { z } from "./deps.ts";
import { createPentagon } from "pentagon/mod.ts";

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

export const kv = await Deno.openKv();

export function createMockDatabase() {
  return createPentagon(kv, {
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
  });
}

export interface Schema extends Record<string, TableDefinition> {
  users: {
    schema: typeof User;
    relations: {
      myOrders: ["orders", [typeof Order], "id", "userId"];
      myPosts: ["posts", [typeof Post], "id", "userId"];
    };
  };
  orders: {
    schema: typeof Order;
    relations: {
      user: ["users", typeof User, "userId", "id"];
    };
  };
  posts: {
    schema: typeof Post;
    relations: {
      user: ["users", typeof User, "userId", "id"];
    };
  };
}
