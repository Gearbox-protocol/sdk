import { createPublicClient, erc20Abi, http } from "viem";
import { expect, it, vi } from "vitest";

import { isRateLimitError } from "./isRateLimitError.js";

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

function makeClient(
  status: number,
  body: string,
  headers?: Record<string, string>,
) {
  return createPublicClient({
    transport: http("https://test.rpc", {
      fetchFn: mockFetchResponse(status, body, headers),
      retryCount: 0,
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

const cases: Array<{
  name: string;
  status: number;
  body: string;
  headers?: Record<string, string>;
  retryAfterMs?: number;
}> = [
  {
    name: "Alchemy - compute units exceeded (code 429, status 429)",
    status: 429,
    body: '{"jsonrpc":"2.0","id":4999,"error":{"code":429,"message":"Your app has exceeded its compute units per second capacity. If you have retries enabled, you can safely ignore this message. If not, check out https://docs.alchemy.com/reference/throughput"}}',
  },
  {
    name: "DRPC - Too many request (code 15, status 429)",
    status: 429,
    body: '{"id":5050,"jsonrpc":"2.0","error":{"message":"Too many request, try again later","code":15}}',
  },
  {
    name: "Ankr - 429 Too Many Requests HTML (status 429)",
    status: 429,
    body: "<html>\r\n<head><title>429 Too Many Requests</title></head>\r\n<body>\r\n<center><h1>429 Too Many Requests</h1></center>\r\n<hr><center>nginx</center>\r\n</body>\r\n</html>\r\n",
    headers: { "content-type": "text/html" },
  },
  {
    name: "Thirdweb - rate limited (status 429)",
    status: 429,
    body: "You've been rate limited, please upgrade your plan.\n",
    headers: { "content-type": "text/plain; charset=utf-8" },
  },
  {
    name: "Monad direct/Cloudflare - 1015 with retry-after (status 429)",
    status: 429,
    body: "<!doctype html><html><head><title>Access denied</title></head><body><h2>You are being rate limited</h2></body></html>",
    headers: {
      "content-type": "text/html; charset=UTF-8",
      "retry-after": "10",
    },
    retryAfterMs: 10_000,
  },
  {
    name: "Generic - retry after hint in message (code -32005, status 200)",
    status: 200,
    body: '{"jsonrpc":"2.0","id":1,"error":{"code":-32005,"message":"Request limit exceeded, retry after 5 seconds"}}',
  },
];

it.each(cases)("isRateLimitError - $name", async ({
  status,
  body,
  headers,
  retryAfterMs,
}) => {
  const client = makeClient(status, body, headers);
  await expect(callSymbol(client)).rejects.toSatisfy((e: Error) => {
    const [isRateLimit, ms] = isRateLimitError(e);
    if (retryAfterMs !== undefined) {
      expect(ms).toBe(retryAfterMs);
    }
    return isRateLimit;
  });
});

it("isRateLimitError - returns false for non-rate-limit RPC error", async () => {
  const client = makeClient(
    200,
    '{"jsonrpc":"2.0","id":1,"error":{"code":-32000,"message":"header not found"}}',
  );
  await expect(callSymbol(client)).rejects.toSatisfy((e: Error) => {
    const [isRateLimit, ms] = isRateLimitError(e);
    expect(ms).toBeUndefined();
    return !isRateLimit;
  });
});
