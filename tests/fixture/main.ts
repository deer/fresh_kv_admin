/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import "$std/dotenv/load.ts";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import kvPlugin, { KvPluginOptions } from "../../plugin/kv_admin.ts";
import * as path from "$std/path/mod.ts";

const options: KvPluginOptions = {
  modelPath: path.join(path.dirname(import.meta.url), "types.ts"),
};

await start(manifest, { plugins: [await kvPlugin(options)] });
