import { Plugin } from "$fresh/server.ts";
import type { HandlerContext, PluginRoute } from "$fresh/src/server/types.ts";
import { PentagonMethods, TableDefinition } from "pentagon/mod.ts";
import { ZodObject } from "z";
import { createMockDatabase } from "../tests/fixture/types.ts";
import ModelsList from "../components/ModelsList.tsx";
import AllItems from "../components/AllItems.tsx";
import Item from "../components/Item.tsx";
import Form from "../components/Form.tsx";

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
    const capitalizedModelName = singularName[0].toUpperCase() +
      singularName.slice(1);
    const schema = models[capitalizedModelName] as unknown as ZodObject<
      any,
      any,
      any
    >;
    if (schema === undefined) {
      continue;
    }
    realModels.push(modelName);

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
            const items = await (tableDef as PentagonMethods<TableDefinition>)
              .findMany({});
            return ctx.render({ items, modelName });
          },
          POST: async (req: Request, _ctx: HandlerContext) => {
            const form = await req.formData();
            const data = Object.fromEntries(form);
            let item = await (tableDef as PentagonMethods<TableDefinition>)
              .findFirst({
                where: { id: data.id },
              });
            if (!item) {
              item = await (tableDef as PentagonMethods<TableDefinition>)
                .create({ data });
            }

            const headers = new Headers();
            headers.set("Location", `/${modelName}/${item.id}`);
            return new Response(null, {
              status: 303,
              headers,
            });
          },
        },
        component: AllItems,
      },
      {
        path: `/${modelName}/[id]`,
        handler: async (_req: Request, ctx: HandlerContext) => {
          const item = await (tableDef as PentagonMethods<TableDefinition>)
            .findFirst({
              where: { id: ctx.params.id },
            });
          return ctx.render({ item, modelName });
        },
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
