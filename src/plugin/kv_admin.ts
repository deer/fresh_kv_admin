// deno-lint-ignore-file no-explicit-any
import { Plugin } from "../../deps.ts";
import type { FreshContext, PluginRoute, ZodObject } from "../../deps.ts";
import { createPentagon, TableDefinition } from "../../deps.ts";
import ModelsList from "../components/ModelsList.tsx";
import AllItems from "../islands/AllItems.tsx";
import Item from "../islands/Item.tsx";
import Form from "../components/Form.tsx";
export interface ConnectorSchema<T> {
  modelName: string;
  zodSchema: ZodObject<any>;
  create: (data: any) => Promise<T>;
  read: (id: string) => Promise<T>;
  readAll: () => Promise<T[]>;
  update: (id: string, data: any) => Promise<T>;
  delete: (id: string) => Promise<void>;
  deleteAll: () => Promise<void>;
}
export interface Connector {
  schemas: ConnectorSchema<any>[];
}

export class PentagonConnector implements Connector {
  schemas: ConnectorSchema<any>[];

  private constructor(schemas: ConnectorSchema<any>[]) {
    this.schemas = schemas;
  }

  static async create(kv: any, modelPath: string): Promise<PentagonConnector> {
    const dbModule = await import(modelPath);
    const { pentagonSchema } = dbModule as {
      pentagonSchema: Record<string, TableDefinition>;
    };

    const db = createPentagon(kv, pentagonSchema);

    const schemas: ConnectorSchema<any>[] = Object.entries(pentagonSchema).map((
      [modelName, table],
    ) => ({
      modelName: modelName,
      zodSchema: table.schema,
      create: async (data) => await db[modelName].create({ data }),
      read: async (id) => await db[modelName].findFirst({ where: { id: id } }),
      readAll: async () => await db[modelName].findMany({}),
      update: async (id, data) =>
        await db[modelName].update({ where: { id: id }, data }),
      delete: async (id) => {
        await db[modelName].delete({ where: { id: id } });
      },
      deleteAll: async () => {
        await db[modelName].deleteMany({});
      },
    }));

    return new PentagonConnector(schemas);
  }
}

export type KvAdminOptions = {
  modelPath: string;
  connector?: Connector;
};

export async function kvAdminPlugin(
  options: KvAdminOptions,
): Promise<Plugin> {
  const kv = await Deno.openKv();

  const connector: Connector = options.connector ||
    await PentagonConnector.create(kv, options.modelPath);

  const routes: PluginRoute[] = [];
  for (const schema of connector.schemas) {
    const modelName = schema.modelName;
    routes.push(
      {
        path: `/${modelName}/new`,
        handler: (_req, ctx) =>
          ctx.render({ schema: schema.zodSchema, modelName }),
        component: Form,
      },
      {
        path: `/${modelName}`,
        handler: {
          GET: async (_req, ctx) => {
            const items = await schema.readAll();
            return ctx.render({ items, modelName });
          },
          POST: async (req: Request, _ctx: FreshContext) => {
            const form = await req.formData();
            const data = Object.fromEntries(form);
            let item;
            try {
              item = await schema.read(data.id as string);
              if (!item) {
                item = await schema.create(data);
              }
            } catch (_error) {
              item = await schema.create(data);
            }

            const headers = new Headers();
            headers.set("Location", `/${modelName}/${item.id}`);
            return new Response(null, {
              status: 303,
              headers,
            });
          },
          DELETE: async (_req: Request, _ctx: FreshContext) => {
            await schema.deleteAll();
            return new Response(null, { status: 204 }); // 204 No Content
          },
        },
        component: AllItems,
      },
      {
        path: `/${modelName}/[id]`,
        handler: {
          GET: async (_req: Request, ctx: FreshContext) => {
            const item = await schema.read(ctx.params.id);
            return ctx.render({ item, modelName, standalone: true });
          },
          DELETE: async (_req: Request, ctx: FreshContext) => {
            await schema.delete(ctx.params.id);
            return new Response("deleted", { status: 200 });
          },
        },
        component: Item,
      },
      {
        path: "/models",
        handler: (_req, ctx) =>
          ctx.render({
            models: connector.schemas.map((s) => s.modelName),
          }),
        component: ModelsList,
      },
    );
  }

  return {
    name: "kvPlugin",
    routes: routes,
    islands: {
      paths: ["../islands/Item.tsx", "../islands/AllItems.tsx"],
      baseLocation: import.meta.url,
    },
  };
}
