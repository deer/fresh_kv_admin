import { Handler, Plugin } from "$fresh/server.ts";
import type {
  HandlerContext,
  Handlers,
  PluginRoute,
} from "$fresh/src/server/types.ts";
import {
  createPentagon,
  PentagonMethods,
  TableDefinition,
} from "pentagon/mod.ts";
import Form from "../components/Form.tsx";

function generateHandlers(model: PentagonMethods<TableDefinition>): Handlers {
  return {
    GET: async (_req, ctx) => {
      const item = await model.findFirst({
        where: { id: ctx.params.id },
      });
      return ctx.render(item);
    },
    POST: async (req, ctx) => {
      const form = await req.formData();
      const data = Object.fromEntries(form);
      const item = await model.create({ data });
      return ctx.render(item);
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
  const models = await import(options.modelPath);

  const kv = await Deno.openKv();
  const db = createPentagon(kv, models);

  const routes: PluginRoute[] = [];
  for (const [modelName, model] of Object.entries(db)) {
    const handlers = generateHandlers(
      model as PentagonMethods<TableDefinition>,
    );

    // Create a closure that captures the `model` variable
    const getHandler = (model: PentagonMethods<TableDefinition>) => {
      return (_req: Request, ctx: HandlerContext) => {
        const props = {
          model: model,
        };
        return ctx.render(props);
      };
    };

    routes.push(
      { path: `/${modelName}/:id`, handler: handlers.GET },
      {
        path: `/${modelName}`,
        handler: {
          GET: getHandler(model), // Render the form
          POST: handlers.POST, // Handle form submission
        },
        component: Form,
      },
      { path: `/${modelName}/:id`, handler: handlers.PUT },
      { path: `/${modelName}/:id`, handler: handlers.DELETE },
    );
  }

  return {
    name: "kvPlugin",
    routes: routes,
  };
}
