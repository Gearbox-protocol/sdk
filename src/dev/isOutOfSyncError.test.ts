import { createPublicClient, erc20Abi, http } from "viem";
import { expect, it, vi } from "vitest";

import { isOutOfSyncError } from "./isOutOfSyncError.js";

const TOKEN_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

function mockFetchResponse(status: number, body: string): typeof fetch {
  return vi.fn<typeof fetch>().mockResolvedValue(
    new Response(body, {
      status,
      headers: { "content-type": "application/json" },
    }),
  );
}

function makeClient(status: number, body: string) {
  return createPublicClient({
    transport: http("https://test.rpc", {
      fetchFn: mockFetchResponse(status, body),
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

const cases: Array<{ name: string; status: number; body: string }> = [
  {
    name: "Alchemy Mainnet - Unknown block (code 3, status 400)",
    status: 400,
    body: '{"jsonrpc":"2.0","id":1,"error":{"code":3,"message":"Unknown block"}}',
  },
  {
    name: "DRPC Mainnet - Unknown block (code 26, status 400)",
    status: 400,
    body: '{"id":6,"jsonrpc":"2.0","error":{"message":"Unknown block","code":26}}',
  },
  {
    name: "Ankr Mainnet - header not found (code -32000, status 200)",
    status: 200,
    body: '{"id":11,"jsonrpc":"2.0","error":{"code":-32000,"message":"header not found"}}',
  },
  {
    name: "Monad Alchemy - Block requested not found (code -32602, status 200)",
    status: 200,
    body: '{"jsonrpc":"2.0","error":{"code":-32602,"message":"Block requested not found. Request might be querying historical state that is not available. If possible, reformulate query to point to more recent blocks"},"id":38}',
  },
  {
    name: "Somnia Ankr - unable to load historical state (code -1, status 200)",
    status: 200,
    body: '{"id":64,"jsonrpc":"2.0","error":{"code":-1,"message":"unable to load historical state","data":null}}',
  },
  {
    name: "Etherlink Ankr - No state available for block (code -32603, status 200)",
    status: 200,
    body: '{"id":80,"jsonrpc":"2.0","error":{"code":-32603,"message":"Error:\\n  No state available for block 82906240\\n"}}',
  },
  {
    name: "Generic - block not found (code -32001, status 200)",
    status: 200,
    body: '{"jsonrpc":"2.0","id":1,"error":{"code":-32001,"message":"block not found"}}',
  },
  {
    name: "Optimism proxyd - block is out of range (code -32019, status 400)",
    status: 400,
    body: '{"jsonrpc":"2.0","id":1,"error":{"code":-32019,"message":"block is out of range"}}',
  },
  {
    name: "EIP-1474 - resource not found (code -32001, status 200)",
    status: 200,
    body: '{"jsonrpc":"2.0","id":1,"error":{"code":-32001,"message":"resource not found"}}',
  },
];

it.each(cases)("isOutOfSyncError - $name", async ({ status, body }) => {
  const client = makeClient(status, body);
  await expect(callSymbol(client)).rejects.toSatisfy((e: Error) =>
    isOutOfSyncError(e),
  );
});
