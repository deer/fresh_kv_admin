import { Plugin } from "$fresh/server.ts";
import type { Handlers, PluginRoute } from "$fresh/src/server/types.ts";
import { PentagonMethods, TableDefinition } from "pentagon/mod.ts";
import Form from "../components/Form.tsx";
import { z } from "../tests/fixture/deps.ts";
import { createMockDatabase } from "../tests/fixture/types.ts";
import Item from "../components/Item.tsx";
import AllItems from "../components/AllItems.tsx";
import ModelsList from "../components/ModelsList.tsx";

function generateHandlers(
  model: PentagonMethods<TableDefinition>,
  schema: z.ZodObject<any, any, any>,
  modelName: string,
): Handlers {
  console.log(schema);
  return {
    GET: async (_req, ctx) => {
      const item = await model.findFirst({
        where: { id: ctx.params.id },
      });
      return ctx.render({ item, modelName });
    },
    POST: async (req, ctx) => {
      //   console.log(schema);
      //   const kv = await Deno.openKv();

      //   const form = await req.formData();
      //   const data = Object.fromEntries(form);
      //   console.log(data);
      //   const item2 = await model.findFirst({
      //     where: { id: data.id },
      //   });
      //   if (item2) {
      //     return ctx.render({ schema: schema, item: item2 });
      //   }
      //   const temp = [];
      //   const entries = await kv.list({ prefix: ["users"] });
      //   for await (const entry of entries) {
      //     temp.push(entry);
      //   }
      //   const item = await model.create({ data });
      //   return ctx.render({ schema: schema, item: item });

      const form = await req.formData();
      const data = Object.fromEntries(form);
      let item = await model.findFirst({
        where: { id: data.id },
      });
      if (item) {
        return ctx.render({ schema: schema, item: item });
      } else {
        item = await model.create({ data });
      }

      const headers = new Headers();
      headers.set("Location", `/${modelName}/${item.id}`);
      return new Response(null, {
        status: 303,
        headers,
      });
    },
    PUT: async (req, ctx) => {
      const form = await req.formData();
      const data = Object.fromEntries(form);
      const item = await model.update({
        where: { id: ctx.params.id },
        data,
      });
      return ctx.render(item);
    },
    DELETE: async (_req, ctx) => {
      const item = await model.delete({ where: { id: ctx.params.id } });
      return ctx.render(item);
    },
  };
}

export type KvPluginOptions = {
  modelPath: string;
};

export default async function kvPlugin(
  options: KvPluginOptions,
): Promise<Plugin> {
  const models = await import(options.modelPath) as Record<
    string,
    unknown
  >;

  const db = createMockDatabase();

  const routes: PluginRoute[] = [];
  const realModels: string[] = [];
  for (const [modelName, tableDef] of Object.entries(db)) {
    const singularName = modelName.slice(0, -1);
    const modStr = singularName[0].toUpperCase() + singularName.slice(1);
    const schema = models[modStr] as unknown as z.ZodObject<any, any, any>;
    if (schema === undefined) {
      continue;
    }
    realModels.push(modelName);
    const handlers = generateHandlers(
      tableDef as PentagonMethods<TableDefinition>,
      schema,
      modelName,
    );

    routes.push(
      {
        path: `/${modelName}/new`,
        handler: (_req, ctx) => ctx.render({ schema, modelName }),
        component: Form,
      },
      {
        path: `/${modelName}`,
        handler: {
          GET: async (_req, ctx) => {
            const items = await tableDef.findMany({});
            return ctx.render({ items, modelName });
          },
          POST: handlers.POST,
        },
        component: AllItems,
      },
      {
        path: `/${modelName}/[id]`,
        handler: handlers.GET,
        component: Item,
      },
      {
        path: "/models",
        handler: {
          GET: (_req, ctx) => {
            return ctx.render({ realModels });
          },
        },
        component: ModelsList,
      },
    );
  }

  return {
    name: "kvPlugin",
    routes: routes,
  };
}
