import { setTimeout } from "node:timers";
import { createPublicClient, type PublicClient, RpcError } from "viem";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MAX_UINT256 } from "../sdk/index.js";
import {
  RevolverTransport,
  type RevolverTransportConfig,
} from "./RevolverTransport";
import { RpcServerMock } from "./RpcServer.mock";

let s1: RpcServerMock;
let s2: RpcServerMock;
let s3: RpcServerMock;
let unwatch: (() => void) | undefined;

beforeEach(async () => {
  s1 = new RpcServerMock(3000);
  s2 = new RpcServerMock(3001);
  s3 = new RpcServerMock(3002);
  await Promise.all([s1.start(), s2.start(), s3.start()]);
});

afterEach(async () => {
  unwatch?.();
  await Promise.all([s1.stop(), s2.stop(), s3.stop()]);
});

function createClient(opts?: Partial<RevolverTransportConfig>): PublicClient {
  return createPublicClient({
    pollingInterval: 10,
    transport: RevolverTransport.create({
      network: "Mainnet",
      providers: [
        {
          provider: "custom",
          keys: [s1.url],
        },
        {
          provider: "custom",
          keys: [s2.url],
        },
        {
          provider: "custom",
          keys: [s3.url],
        },
      ],
      cooldown: 50,
      retryCount: 2,
      ...opts,
    }),
  });
}

it("should rotate to next transport", async () => {
  let blockNumber = 0n;
  let brokenAt = MAX_UINT256;
  const onRotateSuccess = vi.fn();
  const client = createClient({ onRotateSuccess });
  unwatch = client.watchBlockNumber({
    onBlockNumber: async block => {
      blockNumber = BigInt(block);
    },
  });
  setTimeout(() => {
    brokenAt = s1.break(1000);
  }, 200);
  await expect(
    vi.waitUntil(() => blockNumber > brokenAt + 5n, { timeout: 2000 }),
  ).resolves.toBeTruthy();
  expect(onRotateSuccess).toHaveBeenCalledWith(
    "custom-0",
    "custom-1",
    expect.any(RpcError),
  );
});

it.skip("should rotate to first available transport", async () => {
  // TODO: Test that rotation moves to the next transport in sequence
});

it.skip("should rotate over transport in cooldown", async () => {
  // TODO: Test that rotation moves to the next transport in sequence
});

it.skip("should rotate in loop", async () => {});

it.skip("should fail when all transports are broken", async () => {});

it.skip("should handle single transport scenario", async () => {
  // TODO: Test with only one transport
});
