import { createPublicClient, http } from "viem";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { resilientTransport } from "./resilientTransport.js";

function rpcSuccess(id: number, result: string): Response {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, result }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function rpcError(
  id: number,
  code: number,
  message: string,
  httpStatus = 200,
  headers: Record<string, string> = {},
): Response {
  return new Response(
    JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }),
    {
      status: httpStatus,
      headers: { "content-type": "application/json", ...headers },
    },
  );
}

function httpError(
  status: number,
  body: string,
  headers: Record<string, string> = {},
): Response {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html", ...headers },
  });
}

function sequenceFetch(
  handlers: Array<(id: number) => Response>,
): typeof fetch {
  let call = 0;
  return vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
    const id = extractId(init);
    const handler = handlers[call++];
    if (!handler) throw new Error(`unexpected fetch call #${call}`);
    return handler(id);
  }) as typeof fetch;
}

function extractId(init?: RequestInit): number {
  try {
    const body =
      typeof init?.body === "string"
        ? init.body
        : init?.body instanceof Uint8Array
          ? new TextDecoder().decode(init.body)
          : "{}";
    return (JSON.parse(body) as { id?: number }).id ?? 0;
  } catch {
    return 0;
  }
}

function makeClient(
  fetchFn: typeof fetch,
  resilientOpts?: Parameters<typeof resilientTransport>[1],
) {
  return createPublicClient({
    transport: resilientTransport(
      http("https://test.rpc", { fetchFn, retryCount: 0 }),
      resilientOpts,
    ),
  });
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

it("retries on rate limit (429) then succeeds", async () => {
  const fetchFn = sequenceFetch([
    id => rpcError(id, 429, "rate limited", 429),
    id => rpcSuccess(id, "0x1a"),
  ]);
  const client = makeClient(fetchFn);

  await expect(client.getBlockNumber()).resolves.toBe(26n);
  expect(fetchFn).toHaveBeenCalledTimes(2);
});

it("retries on transient HTTP 502 then succeeds", async () => {
  const fetchFn = sequenceFetch([
    () => httpError(502, "<html>502 Bad Gateway</html>"),
    id => rpcSuccess(id, "0x2"),
  ]);
  const client = makeClient(fetchFn);

  await expect(client.getBlockNumber()).resolves.toBe(2n);
  expect(fetchFn).toHaveBeenCalledTimes(2);
});

it("retries on out-of-sync RPC error then succeeds", async () => {
  const fetchFn = sequenceFetch([
    id => rpcError(id, -32_000, "header not found"),
    id => rpcSuccess(id, "0x3"),
  ]);
  const client = makeClient(fetchFn);

  await expect(client.getBlockNumber()).resolves.toBe(3n);
  expect(fetchFn).toHaveBeenCalledTimes(2);
});

it("does not retry non-retryable execution reverted", async () => {
  const fetchFn = sequenceFetch([id => rpcError(id, 3, "execution reverted")]);
  const client = makeClient(fetchFn);

  await expect(client.getBlockNumber()).rejects.toBeDefined();
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

it("throws after exhausting retries", async () => {
  const fetchFn = sequenceFetch([
    id => rpcError(id, 429, "rate limited", 429),
    id => rpcError(id, 429, "rate limited", 429),
    id => rpcError(id, 429, "rate limited", 429),
  ]);
  const client = makeClient(fetchFn, { retryCount: 1 });

  await expect(client.getBlockNumber()).rejects.toBeDefined();
  expect(fetchFn).toHaveBeenCalledTimes(2);
});

it("retries 429 with Retry-After header then succeeds", async () => {
  const fetchFn = sequenceFetch([
    () => httpError(429, "Too Many Requests", { "retry-after": "0" }),
    id => rpcSuccess(id, "0x4"),
  ]);
  const client = makeClient(fetchFn);

  await expect(client.getBlockNumber()).resolves.toBe(4n);
  expect(fetchFn).toHaveBeenCalledTimes(2);
});
