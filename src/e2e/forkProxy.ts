import { existsSync, readFileSync, writeFileSync } from "node:fs";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";

export const FORK_PROXY_PORT = 8548;

interface JsonRpcRequest {
  jsonrpc?: string;
  id?: unknown;
  method: string;
  params?: unknown[];
}

interface JsonRpcResponse {
  jsonrpc: string;
  id: unknown;
  result?: unknown;
  error?: unknown;
}

/**
 * What anvil asks the upstream node for while it executes a fork.
 *
 * All of it is state at the pinned fork block, which is immutable, so an answer
 * recorded once is an answer forever — the point of caching it on disk.
 */
const CACHEABLE = new Set([
  "eth_chainId",
  "net_version",
  "eth_getBalance",
  "eth_getCode",
  "eth_getStorageAt",
  "eth_getTransactionCount",
  "eth_getProof",
  "eth_getBlockByNumber",
  "eth_getBlockByHash",
  "eth_getTransactionByHash",
  "eth_getTransactionReceipt",
  "eth_getLogs",
  "eth_call",
  "eth_feeHistory",
]);

/** Block tags that mean "whatever it is now", so an answer to them does not keep. */
const MOVING = ["latest", "pending", "safe", "finalized"];

function cacheKey(request: JsonRpcRequest): string | undefined {
  if (!CACHEABLE.has(request.method)) return undefined;
  const params = JSON.stringify(request.params ?? []).toLowerCase();
  if (MOVING.some(tag => params.includes(`"${tag}"`))) return undefined;
  return `${request.method}|${params}`;
}

export interface ForkProxyOptions {
  port: number;
  /** Where to send what the cache does not have. Absent: nothing may miss. */
  upstream?: string;
  /** JSON file the answers live in, written back when new ones arrive. */
  cacheFile: string;
}

export interface ForkProxy {
  url: string;
  close(): Promise<void>;
}

/**
 * A cache between anvil and the archive node it forks from.
 *
 * Anvil fetches the state a transaction touches one slot at a time as the EVM
 * reaches it, and the fixture in `*-rpc-cache.json` only holds what attaching
 * the SDK reads — so executing a routed swap sends a few dozen sequential
 * round trips to the upstream node, and `evm_revert` between tests drops what
 * they brought, leaving the next test to fetch it again. Same block, same
 * answers, so they are kept here instead: the first run pays for them, every
 * run after that reads them off the disk.
 */
export async function startForkProxy(
  opts: ForkProxyOptions,
): Promise<ForkProxy> {
  const { port, upstream, cacheFile } = opts;

  const cache = new Map<string, unknown>(
    existsSync(cacheFile)
      ? Object.entries(
          JSON.parse(readFileSync(cacheFile, "utf-8")) as Record<
            string,
            unknown
          >,
        )
      : [],
  );
  const loaded = cache.size;
  let hits = 0;
  let missed = 0;
  let upstreamMs = 0;

  async function ask(requests: JsonRpcRequest[]): Promise<JsonRpcResponse[]> {
    if (!upstream) {
      throw new Error(
        `fork RPC cache has no answer for ${requests.map(r => r.method).join(", ")}, ` +
          "and RPC_URL is unset to fetch one",
      );
    }
    const started = performance.now();
    const response = await fetch(upstream, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(requests),
    });
    upstreamMs += performance.now() - started;
    const body = (await response.json()) as JsonRpcResponse | JsonRpcResponse[];
    return Array.isArray(body) ? body : [body];
  }

  const server = createServer(
    (request: IncomingMessage, response: ServerResponse) => {
      const chunks: Buffer[] = [];
      request.on("data", (chunk: Buffer) => chunks.push(chunk));
      request.on("end", async () => {
        try {
          const body = JSON.parse(Buffer.concat(chunks).toString()) as
            | JsonRpcRequest
            | JsonRpcRequest[];
          const batch = Array.isArray(body) ? body : [body];
          const answers = new Array<JsonRpcResponse>(batch.length);
          const missing: { at: number; request: JsonRpcRequest }[] = [];

          batch.forEach((call, at) => {
            const key = cacheKey(call);
            if (key !== undefined && cache.has(key)) {
              hits++;
              answers[at] = {
                jsonrpc: "2.0",
                id: call.id ?? null,
                result: cache.get(key),
              };
            } else {
              missing.push({ at, request: call });
            }
          });

          if (missing.length > 0) {
            missed += missing.length;
            const fetched = await ask(missing.map(m => m.request));
            missing.forEach(({ at, request: call }, index) => {
              const answer =
                fetched.find(f => f.id === call.id) ?? fetched[index];
              answers[at] = {
                jsonrpc: "2.0",
                id: call.id ?? null,
                result: answer?.result,
                ...(answer?.error !== undefined && { error: answer.error }),
              };
              const key = cacheKey(call);
              if (key !== undefined && answer?.error === undefined) {
                cache.set(key, answer?.result);
              }
            });
          }

          response.writeHead(200, { "content-type": "application/json" });
          response.end(
            JSON.stringify(Array.isArray(body) ? answers : answers[0]),
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error(`[fork-proxy] ${message}`);
          response.writeHead(502, { "content-type": "text/plain" });
          response.end(message);
        }
      });
    },
  );

  await new Promise<void>((done, fail) => {
    server.on("error", fail);
    server.listen(port, "127.0.0.1", () => done());
  });

  return {
    url: `http://127.0.0.1:${port}`,
    async close() {
      await new Promise<void>((done, fail) =>
        server.close(err => (err ? fail(err) : done())),
      );
      if (cache.size > loaded) {
        writeFileSync(
          cacheFile,
          `${JSON.stringify(Object.fromEntries(cache))}\n`,
        );
        console.log(
          `[fork-proxy] ${hits} served from cache, ${missed} fetched in ` +
            `${(upstreamMs / 1000).toFixed(1)}s; cache grew ${loaded} -> ${cache.size} entries`,
        );
      }
    },
  };
}
