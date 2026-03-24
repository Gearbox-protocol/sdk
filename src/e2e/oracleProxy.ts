import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { resolve } from "node:path";

export interface HttpRecording {
  url: string;
  response: {
    status: number;
    headers: Record<string, string>;
    body: string;
  };
}

interface ProxyRoute {
  prefix: string;
  target: string;
}

export const ORACLE_PROXY_PORT = 8547;

export const ORACLE_ROUTES: ProxyRoute[] = [
  { prefix: "/pyth", target: "https://hermes.pyth.network" },
  // https://github.com/redstone-finance/redstone-oracles-monorepo/blob/42e83b381a91cbcc814e4105cf5b7d9f8a29d6fc/packages/sdk/src/data-services-urls.ts#L10
  { prefix: "/rs0", target: "https://oracle-gateway-1.a.redstone.vip" },
  { prefix: "/rs1", target: "https://oracle-gateway-2.a.redstone.finance" },
];

export const PYTH_API_PROXY = `http://localhost:${ORACLE_PROXY_PORT}/pyth/v2/updates/price`;
export const REDSTONE_GATEWAYS = [
  `http://localhost:${ORACLE_PROXY_PORT}/rs0`,
  `http://localhost:${ORACLE_PROXY_PORT}/rs1`,
];

export interface OracleProxyOptions {
  port: number;
  mode: "record" | "playback";
  recordingsDir: string;
}

export interface OracleProxy {
  url: string;
  close(): Promise<void>;
}

function hashUrl(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 16);
}

function resolveOriginalUrl(
  requestUrl: string,
  routes: ProxyRoute[],
): { route: ProxyRoute; originalUrl: string } | undefined {
  for (const route of routes) {
    if (
      requestUrl.startsWith(route.prefix + "/") ||
      requestUrl === route.prefix
    ) {
      const rest = requestUrl.slice(route.prefix.length);
      return { route, originalUrl: route.target + rest };
    }
  }
  return undefined;
}

function loadRecordingsFromDir(dir: string): Map<string, HttpRecording> {
  const map = new Map<string, HttpRecording>();
  if (!existsSync(dir)) {
    return map;
  }
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".json")) continue;
    const content = readFileSync(resolve(dir, file), "utf-8");
    const rec = JSON.parse(content) as HttpRecording;
    map.set(rec.url, rec);
  }
  return map;
}

export async function startOracleProxy(
  opts: OracleProxyOptions,
): Promise<OracleProxy> {
  const { port, mode, recordingsDir } = opts;

  if (mode === "record") {
    if (!existsSync(recordingsDir)) {
      mkdirSync(recordingsDir, { recursive: true });
    }
  }

  const recordings =
    mode === "playback" ? loadRecordingsFromDir(recordingsDir) : undefined;

  let requestCount = 0;

  const server = createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      const requestUrl = req.url ?? "/";
      const resolved = resolveOriginalUrl(requestUrl, ORACLE_ROUTES);

      if (!resolved) {
        res.writeHead(404, { "content-type": "text/plain" });
        res.end(`No route matched for ${requestUrl}`);
        return;
      }

      const { originalUrl } = resolved;

      try {
        if (mode === "record") {
          const upstream = await fetch(originalUrl);
          const body = await upstream.text();
          const headers: Record<string, string> = {};
          const skipHeaders = new Set([
            "content-encoding",
            "transfer-encoding",
            "content-length",
          ]);
          upstream.headers.forEach((value, key) => {
            if (!skipHeaders.has(key)) {
              headers[key] = value;
            }
          });

          const rec: HttpRecording = {
            url: originalUrl,
            response: { status: upstream.status, headers, body },
          };

          const filename = `${hashUrl(originalUrl)}.json`;
          writeFileSync(
            resolve(recordingsDir, filename),
            JSON.stringify(rec, null, 2) + "\n",
          );
          requestCount++;
          console.log(
            `[proxy:record] ${originalUrl} -> ${upstream.status} (${body.length} bytes)`,
          );

          res.writeHead(upstream.status, headers);
          res.end(body);
        } else {
          const rec = recordings?.get(originalUrl);
          if (!rec) {
            const available = Array.from(recordings?.keys() ?? []).join("\n  ");
            const msg = `No recording found for:\n  ${originalUrl}\nAvailable:\n  ${available}`;
            console.error(`[proxy:playback] ${msg}`);
            res.writeHead(500, { "content-type": "text/plain" });
            res.end(msg);
            return;
          }

          res.writeHead(rec.response.status, rec.response.headers);
          res.end(rec.response.body);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[proxy] Error handling ${originalUrl}: ${msg}`);
        res.writeHead(502, { "content-type": "text/plain" });
        res.end(msg);
      }
    },
  );

  await new Promise<void>((res, rej) => {
    server.on("error", rej);
    server.listen(port, "127.0.0.1", () => res());
  });

  const url = `http://127.0.0.1:${port}`;
  console.log(`[proxy] Oracle proxy started in ${mode} mode on ${url}`);
  if (mode === "playback" && recordings) {
    console.log(
      `[proxy] Loaded ${recordings.size} recordings from ${recordingsDir}`,
    );
  }

  return {
    url,
    async close() {
      await new Promise<void>((res, rej) =>
        server.close(err => (err ? rej(err) : res())),
      );
      if (mode === "record") {
        console.log(
          `[proxy] Recorded ${requestCount} requests to ${recordingsDir}`,
        );
      }
    },
  };
}
