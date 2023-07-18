import { Plugin } from "$fresh/server.ts";
import type { HandlerContext, PluginRoute } from "$fresh/src/server/types.ts";
import { createPentagon, TableDefinition } from "pentagon/mod.ts";
import ModelsList from "../components/ModelsList.tsx";
import AllItems from "../islands/AllItems.tsx";
import Item from "../islands/Item.tsx";
import Form from "../components/Form.tsx";

export type KvPluginOptions = {
  modelPath: string;
};

export default async function kvPlugin(
  options: KvPluginOptions,
): Promise<Plugin> {
  const kv = await Deno.openKv();
  const { schema } = await import(options.modelPath) as {
    schema: Record<string, TableDefinition>;
  };
  const db = createPentagon(kv, schema);

  const routes: PluginRoute[] = [];
  for (const [modelName, table] of Object.entries(schema)) {
    routes.push(
      {
        path: `/${modelName}/new`,
        handler: (_req, ctx) => ctx.render({ schema: table.schema, modelName }),
        component: Form,
      },
      {
        path: `/${modelName}`,
        handler: {
          GET: async (_req, ctx) => {
            const items = await db[modelName].findMany({});
            return ctx.render({ items, modelName });
          },
          POST: async (req: Request, _ctx: HandlerContext) => {
            const form = await req.formData();
            const data = Object.fromEntries(form);
            let item = await db[modelName].findFirst({
              where: { id: data.id },
            });
            if (!item) {
              item = await db[modelName].create({ data });
            }

            const headers = new Headers();
            headers.set("Location", `/${modelName}/${item.id}`);
            return new Response(null, {
              status: 303,
              headers,
            });
          },
          DELETE: async (_req: Request, _ctx: HandlerContext) => {
            await db[modelName].deleteMany({});
            return new Response(null, { status: 204 }); // 204 No Content
          },
        },
        component: AllItems,
      },
      {
        path: `/${modelName}/[id]`,
        handler: {
          GET: async (_req: Request, ctx: HandlerContext) => {
            const item = await db[modelName].findFirst({
              where: { id: ctx.params.id },
            });
            return ctx.render({ item, modelName, standalone: true });
          },
          DELETE: async (_req: Request, ctx: HandlerContext) => {
            await db[modelName].delete({ where: { id: ctx.params.id } });
            return new Response("deleted", { status: 200 });
          },
        },
        component: Item,
      },
      {
        path: "/models",
        handler: (_req, ctx) => ctx.render({ models: Object.keys(schema) }),
        component: ModelsList,
      },
    );
  }

  return {
    name: "kvPlugin",
    routes: routes,
    islands: [{
      name: "Item",
      path: "../islands/Item.tsx",
      component: Item,
    }, {
      name: "AllItems",
      path: "../islands/AllItems.tsx",
      component: AllItems,
    }],
    location: import.meta.url,
  };
}
