import { setTimeout } from "node:timers";
import {
  createPublicClient,
  HttpRequestError,
  type PublicClient,
  RpcError,
} from "viem";
import { afterEach, beforeEach, expect, it, onTestFinished, vi } from "vitest";
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
  RpcServerMock.reset();
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
      cooldown: 100,
      retryCount: 2,
      ...opts,
    }),
  });
}

it("should rotate to next transport", async () => {
  let blockNumber = 0n;
  const onRotateSuccess = vi.fn();
  const client = createClient({ onRotateSuccess });

  unwatch = client.watchBlockNumber({
    onBlockNumber: async block => {
      blockNumber = BigInt(block);
      if (blockNumber === 10n) {
        s1.break(1000n);
      }
    },
  });

  await expect(vi.waitUntil(() => blockNumber > 15n)).resolves.toBeTruthy();
  expect(onRotateSuccess).toHaveBeenCalledWith(
    "custom-0",
    "custom-1",
    expect.any(RpcError),
  );
});

it("should rotate to first available transport", async () => {
  s2.stop();
  let blockNumber = 0n;
  const onRotateSuccess = vi.fn();
  const client = createClient({ onRotateSuccess });
  unwatch = client.watchBlockNumber({
    onBlockNumber: async block => {
      blockNumber = BigInt(block);
      if (blockNumber === 10n) {
        s1.break(1000n);
      }
    },
  });
  await expect(
    vi.waitUntil(() => blockNumber > 15n, { timeout: 2000 }),
  ).resolves.toBeTruthy();
  expect(onRotateSuccess).toHaveBeenCalledWith(
    "custom-0",
    "custom-1",
    expect.any(RpcError),
  );
  expect(onRotateSuccess).toHaveBeenCalledWith(
    "custom-1",
    "custom-2",
    expect.any(HttpRequestError),
  );
});

it("should rotate in loop", async () => {
  let blockNumber = 0n;
  const onRotateSuccess = vi.fn();
  const client = createClient({ onRotateSuccess });
  unwatch = client.watchBlockNumber({
    onBlockNumber: async block => {
      blockNumber = BigInt(block);
      if (blockNumber === 10n) {
        s1.break(10n);
      }
      if (blockNumber === 20n) {
        s2.break(1000n);
      }
      if (blockNumber === 30n) {
        s3.break(1000n);
      }
    },
  });

  await expect(
    vi.waitUntil(() => blockNumber > 35n, { timeout: 2000 }),
  ).resolves.toBeTruthy();
  // console.log(onRotateSuccess.mock.calls);
  expect(onRotateSuccess).toHaveBeenCalledWith(
    "custom-0",
    "custom-1",
    expect.any(RpcError),
  );
  expect(onRotateSuccess).toHaveBeenCalledWith(
    "custom-1",
    "custom-2",
    expect.any(RpcError),
  );
  expect(onRotateSuccess).toHaveBeenCalledWith(
    "custom-2",
    "custom-0",
    expect.any(RpcError),
  );
});

it.skip("should rotate over transport in cooldown", async () => {
  // TODO: Test that rotation moves to the next transport in sequence
});

it.skip("should fail when all transports are broken", async () => {});

it.skip("should handle single transport scenario", async () => {
  // TODO: Test with only one transport
});
