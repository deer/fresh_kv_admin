import {
  TextLineStream,
} from "https://deno.land/std@0.193.0/streams/text_line_stream.ts";
import { delay } from "https://deno.land/std@0.193.0/async/delay.ts";
import {
  default as puppeteer,
  Page,
} from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

export function withPage(fn: (page: Page, address: string) => Promise<void>) {
  return withPageName("./tests/fixture/main.ts", fn);
}

export async function withPageName(
  name: string,
  fn: (page: Page, address: string) => Promise<void>,
) {
  const { lines, serverProcess, address } = await startFreshServer({
    args: ["run", "-A", "--unstable", name],
    env: {
      DENO_UNSTABLE_COVERAGE_DIR: "cov2",
      DENO_DEPLOYMENT_ID: "dummy_id",
    },
  });

  try {
    await delay(100);
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });

    try {
      const page = await browser.newPage();
      await fn(page, address);
    } finally {
      await browser.close();
    }
  } finally {
    await lines.cancel();

    // Wait until the process exits
    await serverProcess.status;
  }
}

export async function startFreshServer(options: Deno.CommandOptions) {
  const { serverProcess, lines, address } = await spawnServer(options);

  if (!address) {
    throw new Error("Server didn't start up");
  }

  return { serverProcess, lines, address };
}

async function spawnServer(
  options: Deno.CommandOptions,
  expectErrors = false,
) {
  const serverProcess = new Deno.Command(Deno.execPath(), {
    ...options,
    stdin: "null",
    stdout: "piped",
    stderr: expectErrors ? "piped" : "inherit",
  }).spawn();

  const decoder = new TextDecoderStream();
  const lines: ReadableStream<string> = serverProcess.stdout
    .pipeThrough(decoder)
    .pipeThrough(new TextLineStream(), {
      preventCancel: true,
    });

  let address = "";
  for await (const line of lines) {
    const match = line.match(/https?:\/\/localhost:\d+/g);
    if (match) {
      address = match[0];
      break;
    }
  }

  return { serverProcess, lines, address };
}
