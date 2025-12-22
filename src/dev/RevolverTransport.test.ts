import {
  BaseError,
  createPublicClient,
  HttpRequestError,
  type PublicClient,
  RpcError,
  type Transport,
} from "viem";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  NoAvailableTransportsError,
  RevolverTransport,
  type RevolverTransportConfig,
  type RevolverTransportValue,
} from "./RevolverTransport.js";
import { RpcServerMock } from "./RpcServer.mock.js";

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

function createClient(
  opts?: Partial<RevolverTransportConfig>,
): PublicClient<Transport<"revolver", RevolverTransportValue>> {
  return createPublicClient({
    pollingInterval: 10,
    transport: RevolverTransport.create({
      network: "Mainnet",
      providers: [
        {
          name: "custom-0",
          url: s1.url,
        },
        {
          name: "custom-1",
          url: s2.url,
        },
        {
          name: "custom-2",
          url: s3.url,
        },
      ],
      defaultCooldown: 100,
      defaultHTTPOptions: {
        retryCount: 2,
      },
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

it("should rotate over transport in cooldown", async () => {
  let blockNumber = 0n;
  const onRotateSuccess = vi.fn();
  const client = createClient({
    onRotateSuccess,
    providers: [
      {
        name: "custom-0",
        url: s1.url,
      },
      {
        name: "custom-1",
        url: s2.url,
        cooldown: Date.now() + 3600_000,
      },
      {
        name: "custom-2",
        url: s3.url,
      },
    ],
  });
  unwatch = client.watchBlockNumber({
    onBlockNumber: async block => {
      blockNumber = BigInt(block);
      if (blockNumber === 10n) {
        s1.break(1n);
      }
    },
  });

  await expect(
    vi.waitUntil(() => blockNumber > 15n, { timeout: 5000 }),
  ).resolves.toBeTruthy();
  // console.log(onRotateSuccess.mock.calls);
  expect(onRotateSuccess).toHaveBeenCalledTimes(1);
  expect(onRotateSuccess).toHaveBeenLastCalledWith(
    "custom-0",
    "custom-2",
    expect.any(RpcError),
  );
});

it("should not overrotate when hadling parallel requests", async () => {
  s1.break(100n);
  s1.enableRandomDelay();

  const client = createClient({
    providers: [
      {
        name: "custom-0",
        url: s1.url,
      },
      {
        name: "custom-1",
        url: s2.url,
      },
    ],
    defaultCooldown: 60_000,
  });
  const resp = await Promise.all([
    client.request({ method: "eth_blockNumber" }),
    client.request({ method: "eth_blockNumber" }),
    client.request({ method: "eth_blockNumber" }),
    client.request({ method: "eth_blockNumber" }),
    client.request({ method: "eth_blockNumber" }),
    client.request({ method: "eth_blockNumber" }),
  ]);

  expect(resp.sort()).toEqual(["0x1", "0x2", "0x3", "0x4", "0x5", "0x6"]);
  expect(client.transport.currentTransportName()).toBe("custom-1");
});

it("request should fail when all transports are broken", async () => {
  s1.stop();
  s2.stop();
  s3.stop();
  const client = createClient({ defaultCooldown: 60_000 });
  await expect(client.getBlockNumber()).rejects.toThrow(
    NoAvailableTransportsError,
  );
});

it("subscription should fail when all transports are broken", async () => {
  s1.stop();
  s2.stop();
  s3.stop();
  const onError = vi.fn();
  const onBlockNumber = vi.fn();
  const client = createClient({ defaultCooldown: 60_000 });
  unwatch = client.watchBlockNumber({
    onBlockNumber,
    onError,
  });
  await vi.waitFor(
    () => {
      expect(onError).toBeCalled();
      expect(onBlockNumber).not.toHaveBeenCalledOnce();
    },
    { timeout: 2000 },
  );
});

it("should rotate manually", async () => {
  const onRotateSuccess = vi.fn();
  const client = createClient({ onRotateSuccess });
  (client.transport as any as RevolverTransport).rotate(new BaseError("foo"));
  expect(onRotateSuccess).toHaveBeenLastCalledWith(
    "custom-0",
    "custom-1",
    expect.any(BaseError),
  );
});

it("should handle single transport scenario", async () => {
  const client = createClient({
    providers: [
      {
        name: "custom-0",
        url: s1.url,
      },
    ],
  });
  await expect(client.getBlockNumber({ cacheTime: 0 })).resolves.toBeDefined();
  await s1.stop();
  await expect(client.getBlockNumber({ cacheTime: 0 })).rejects.toThrow(
    HttpRequestError,
  );
});
