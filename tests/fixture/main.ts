/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import "$std/dotenv/load.ts";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import { kvAdminPlugin, KvPluginOptions } from "../../plugin/kv_admin.ts";
import * as path from "$std/path/mod.ts";

import twindPlugin from "$fresh/plugins/twindv1.ts";
import twindConfig from "./twind.config.ts";

const options: KvPluginOptions = {
  modelPath: path.join(path.dirname(import.meta.url), "types.ts"),
};

const ac = new AbortController();
start(manifest, {
  signal: ac.signal,
  plugins: [await kvAdminPlugin(options), twindPlugin(twindConfig)],
});
setTimeout(() => ac.abort(), 10000);
