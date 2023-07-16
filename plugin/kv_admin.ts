import { Plugin } from "$fresh/server.ts";
import type {
  HandlerContext,
  Handlers,
  PluginRoute,
} from "$fresh/src/server/types.ts";
import { PentagonMethods, TableDefinition } from "pentagon/mod.ts";
import Form from "../components/Form.tsx";
import { z } from "../tests/fixture/deps.ts";
import { createMockDatabase } from "../tests/fixture/types.ts";

function generateHandlers(
  model: PentagonMethods<TableDefinition>,
  schema: z.ZodObject<any, any, any>,
): Handlers {
  console.log(schema);
  return {
    GET: async (_req, ctx) => {
      const kv = await Deno.openKv();
      const temp = [];
      const entries = await kv.list({ prefix: ["users"] });
      for await (const entry of entries) {
        temp.push(entry);
      }
      const item = await model.findFirst({
        where: { id: ctx.params.id },
      });
      return ctx.render({ schema: schema, item: item });
    },
    POST: async (req, ctx) => {
      console.log(schema);
      const kv = await Deno.openKv();

      const form = await req.formData();
      const data = Object.fromEntries(form);
      console.log(data);
      const item2 = await model.findFirst({
        where: { id: data.id },
      });
      if (item2) {
        return ctx.render({ schema: schema, item: item2 });
      }
      const temp = [];
      const entries = await kv.list({ prefix: ["users"] });
      for await (const entry of entries) {
        temp.push(entry);
      }
      const item = await model.create({ data });
      return ctx.render({ schema: schema, item: item });
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
  for (const [modelName, tableDef] of Object.entries(db)) {
    const singularName = modelName.slice(0, -1);
    const modStr = singularName[0].toUpperCase() + singularName.slice(1);
    const schema = models[modStr] as unknown as z.ZodObject<any, any, any>;
    const handlers = generateHandlers(
      tableDef as PentagonMethods<TableDefinition>,
      schema,
    );

    // Create a closure that captures the `model` variable
    const getHandler = (
      model: PentagonMethods<TableDefinition>,
      schema: z.ZodObject<any, any, any>,
    ) => {
      return (_req: Request, ctx: HandlerContext) => {
        const props = {
          model: model,
          schema: schema,
        };
        return ctx.render(props);
      };
    };

    routes.push(
      { path: `/${modStr}/[id]`, handler: handlers, component: Form },
      {
        path: `/${modStr}`,
        handler: {
          GET: getHandler(tableDef, schema), // Render the form
          POST: handlers.POST, // Handle form submission
        },
        component: Form,
      },
    );
  }

  return {
    name: "kvPlugin",
    routes: routes,
  };
}
