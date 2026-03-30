import { createPublicClient, erc20Abi, http } from "viem";
import { expect, it, vi } from "vitest";

import { isTransientError } from "./isTransientError.js";

const TOKEN_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

function mockFetchResponse(
  status: number,
  body: string,
  headers: Record<string, string> = { "content-type": "application/json" },
): typeof fetch {
  return vi
    .fn<typeof fetch>()
    .mockResolvedValue(new Response(body, { status, headers }));
}

function mockFetchThrow(error: Error): typeof fetch {
  return vi.fn<typeof fetch>().mockRejectedValue(error);
}

function mockFetchSlow(): typeof fetch {
  return vi.fn<typeof fetch>().mockImplementation(
    (_input, init) =>
      new Promise<Response>((resolve, reject) => {
        const signal = init?.signal;
        if (signal?.aborted) {
          reject(signal.reason);
          return;
        }
        signal?.addEventListener("abort", () => reject(signal.reason));
      }),
  );
}

function makeClient(fetchFn: typeof fetch, timeout?: number) {
  return createPublicClient({
    transport: http("https://test.rpc", {
      fetchFn,
      retryCount: 0,
      timeout: timeout ?? 30_000,
    }),
  });
}

function callSymbol(client: ReturnType<typeof makeClient>) {
  return client.readContract({
    address: TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: "symbol",
  });
}

// --- HTTP response-based cases ---

const httpCases: Array<{
  name: string;
  status: number;
  body: string;
  headers?: Record<string, string>;
}> = [
  {
    name: "HTTP 502 Bad Gateway - load balancer can't reach backend",
    status: 502,
    body: "<html><body><h1>502 Bad Gateway</h1></body></html>",
    headers: { "content-type": "text/html" },
  },
  {
    name: "HTTP 503 Service Unavailable - server overloaded or in maintenance",
    status: 503,
    body: "Service Temporarily Unavailable",
    headers: { "content-type": "text/plain" },
  },
  {
    name: "HTTP 504 Gateway Timeout - proxy timed out waiting for RPC node",
    status: 504,
    body: "<html><body><h1>504 Gateway Timeout</h1></body></html>",
    headers: { "content-type": "text/html" },
  },
  {
    name: "EIP-1474 ResourceUnavailableRpcError - node syncing (code -32002, status 200)",
    status: 200,
    body: '{"jsonrpc":"2.0","id":1,"error":{"code":-32002,"message":"resource unavailable"}}',
  },
];

it.each(httpCases)("isTransientError - $name", async ({
  status,
  body,
  headers,
}) => {
  const client = makeClient(mockFetchResponse(status, body, headers));
  await expect(callSymbol(client)).rejects.toSatisfy((e: Error) =>
    isTransientError(e),
  );
});

// --- Timeout case ---

it("isTransientError - TimeoutError when RPC doesn't respond in time", async () => {
  const client = makeClient(mockFetchSlow(), 1);
  await expect(callSymbol(client)).rejects.toSatisfy((e: Error) =>
    isTransientError(e),
  );
});

// --- Non-viem error fallback (plain Error with matching message) ---

it("isTransientError - plain Error with 'unknown rpc error' message", () => {
  expect(isTransientError(new Error("An unknown RPC error occurred."))).toBe(
    true,
  );
});

it("isTransientError - plain Error with 'cannot destructure' message", () => {
  expect(
    isTransientError(
      new TypeError(
        "Cannot destructure property 'error' of 'undefined' as it is undefined.",
      ),
    ),
  ).toBe(true);
});

// --- Network error cases (fetch itself throws) ---

const fetchErrorCases: Array<{ name: string; error: Error }> = [
  {
    name: "ECONNRESET - TCP connection reset by server",
    error: new TypeError("fetch failed", {
      cause: Object.assign(new Error("read ECONNRESET"), {
        code: "ECONNRESET",
      }),
    }),
  },
  {
    name: "Socket hang up - server closed connection before response",
    error: new TypeError("fetch failed", {
      cause: new Error("socket hang up"),
    }),
  },
  {
    name: "Failed to fetch - browser DNS/network failure",
    error: new TypeError("Failed to fetch"),
  },
  {
    name: "Network error - browser generic network failure",
    error: new TypeError("Network error"),
  },
];

it.each(fetchErrorCases)("isTransientError - $name", async ({ error }) => {
  const client = makeClient(mockFetchThrow(error));
  await expect(callSymbol(client)).rejects.toSatisfy((e: Error) =>
    isTransientError(e),
  );
});

// --- Negative cases (should return false) ---

it("isTransientError - returns false for rate limit error (status 429)", async () => {
  const client = makeClient(
    mockFetchResponse(
      429,
      '{"jsonrpc":"2.0","id":1,"error":{"code":429,"message":"Your app has exceeded its compute units per second capacity"}}',
    ),
  );
  await expect(callSymbol(client)).rejects.toSatisfy(
    (e: Error) => !isTransientError(e),
  );
});

it("isTransientError - returns false for out-of-sync / header not found error", async () => {
  const client = makeClient(
    mockFetchResponse(
      200,
      '{"jsonrpc":"2.0","id":1,"error":{"code":-32000,"message":"header not found"}}',
    ),
  );
  await expect(callSymbol(client)).rejects.toSatisfy(
    (e: Error) => !isTransientError(e),
  );
});

it("isTransientError - returns false for execution reverted", async () => {
  const client = makeClient(
    mockFetchResponse(
      200,
      '{"jsonrpc":"2.0","id":1,"error":{"code":3,"message":"execution reverted"}}',
    ),
  );
  await expect(callSymbol(client)).rejects.toSatisfy(
    (e: Error) => !isTransientError(e),
  );
});
