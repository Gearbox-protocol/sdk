import { createClient, custom } from "viem";
import { mainnet } from "viem/chains";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { watchBlocksAsync } from "./watchBlocksAsync.js";

const INTERVAL = 1000;

function rpcBlock(n: number) {
  return {
    number: `0x${n.toString(16)}`,
    hash: `0x${"ab".repeat(32)}`,
    parentHash: `0x${"00".repeat(32)}`,
    nonce: `0x${"00".repeat(8)}`,
    sha3Uncles: `0x${"00".repeat(32)}`,
    logsBloom: `0x${"00".repeat(256)}`,
    transactionsRoot: `0x${"00".repeat(32)}`,
    stateRoot: `0x${"00".repeat(32)}`,
    receiptsRoot: `0x${"00".repeat(32)}`,
    miner: `0x${"00".repeat(20)}`,
    difficulty: "0x0",
    totalDifficulty: "0x0",
    extraData: "0x",
    size: "0x0",
    gasLimit: "0x0",
    gasUsed: "0x0",
    timestamp: "0x0",
    transactions: [],
    uncles: [],
  };
}

function fakeClient(request: (...args: unknown[]) => Promise<unknown>) {
  return createClient({
    chain: mainnet,
    transport: custom({ request }, { retryCount: 0 }),
  });
}

function deferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it("calls onBlock for each new block with correct prevBlock", async () => {
  let blockNum = 1;
  const request = vi.fn(async () => rpcBlock(blockNum++));
  const onBlock = vi.fn(async () => {});

  const unwatch = watchBlocksAsync(fakeClient(request), {
    onBlock,
    pollingInterval: INTERVAL,
  });

  await vi.advanceTimersByTimeAsync(INTERVAL);
  expect(onBlock).toHaveBeenCalledTimes(1);
  expect(onBlock).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({ number: 1n }),
    undefined,
  );

  await vi.advanceTimersByTimeAsync(INTERVAL);
  expect(onBlock).toHaveBeenCalledTimes(2);
  expect(onBlock).toHaveBeenNthCalledWith(
    2,
    expect.objectContaining({ number: 2n }),
    expect.objectContaining({ number: 1n }),
  );

  await vi.advanceTimersByTimeAsync(INTERVAL);
  expect(onBlock).toHaveBeenCalledTimes(3);
  expect(onBlock).toHaveBeenNthCalledWith(
    3,
    expect.objectContaining({ number: 3n }),
    expect.objectContaining({ number: 2n }),
  );

  unwatch();
});

it("skips duplicate blocks", async () => {
  const request = vi.fn(async () => rpcBlock(42));
  const onBlock = vi.fn(async () => {});

  const unwatch = watchBlocksAsync(fakeClient(request), {
    onBlock,
    pollingInterval: INTERVAL,
  });

  await vi.advanceTimersByTimeAsync(INTERVAL);
  expect(onBlock).toHaveBeenCalledTimes(1);

  await vi.advanceTimersByTimeAsync(INTERVAL);
  expect(onBlock).toHaveBeenCalledTimes(1);

  await vi.advanceTimersByTimeAsync(INTERVAL);
  expect(onBlock).toHaveBeenCalledTimes(1);

  unwatch();
});

it("drops blocks when handler is busy and calls onDrop", async () => {
  let blockNum = 1;
  const request = vi.fn(async () => rpcBlock(blockNum++));
  const d = deferred();
  const onBlock = vi.fn(async () => {
    await d.promise;
  });
  const onDrop = vi.fn();

  const unwatch = watchBlocksAsync(fakeClient(request), {
    onBlock,
    onDrop,
    pollingInterval: INTERVAL,
  });

  await vi.advanceTimersByTimeAsync(INTERVAL);
  expect(onBlock).toHaveBeenCalledTimes(1);
  expect(onBlock).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({ number: 1n }),
    undefined,
  );

  await vi.advanceTimersByTimeAsync(INTERVAL);
  expect(onBlock).toHaveBeenCalledTimes(1);
  expect(onDrop).toHaveBeenCalledTimes(1);
  expect(onDrop).toHaveBeenCalledWith(expect.objectContaining({ number: 2n }));

  d.resolve();
  await vi.advanceTimersByTimeAsync(0);

  await vi.advanceTimersByTimeAsync(INTERVAL);
  expect(onBlock).toHaveBeenCalledTimes(2);
  expect(onBlock).toHaveBeenNthCalledWith(
    2,
    expect.objectContaining({ number: 3n }),
    expect.objectContaining({ number: 1n }),
  );

  unwatch();
});

it("calls onError when getBlock fails and continues polling", async () => {
  let callCount = 0;
  const request = vi.fn(async () => {
    callCount++;
    if (callCount === 1) throw new Error("rpc failure");
    return rpcBlock(10);
  });
  const onBlock = vi.fn(async () => {});
  const onError = vi.fn();

  const unwatch = watchBlocksAsync(fakeClient(request), {
    onBlock,
    onError,
    pollingInterval: INTERVAL,
  });

  await vi.advanceTimersByTimeAsync(INTERVAL);
  expect(onError).toHaveBeenCalledTimes(1);
  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({
      message: expect.stringContaining("rpc failure"),
    }),
  );
  expect(onBlock).not.toHaveBeenCalled();

  await vi.advanceTimersByTimeAsync(INTERVAL);
  expect(onBlock).toHaveBeenCalledTimes(1);

  unwatch();
});

it("calls onError when onBlock rejects and clears busy flag", async () => {
  let blockNum = 1;
  const request = vi.fn(async () => rpcBlock(blockNum++));
  let handlerCalls = 0;
  const onBlock = vi.fn(async () => {
    handlerCalls++;
    if (handlerCalls === 1) throw new Error("handler error");
  });
  const onError = vi.fn();

  const unwatch = watchBlocksAsync(fakeClient(request), {
    onBlock,
    onError,
    pollingInterval: INTERVAL,
  });

  await vi.advanceTimersByTimeAsync(INTERVAL);
  expect(onError).toHaveBeenCalledTimes(1);
  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({ message: "handler error" }),
  );

  // prevBlock is NOT updated on error, so second call gets prevBlock = undefined
  await vi.advanceTimersByTimeAsync(INTERVAL);
  expect(onBlock).toHaveBeenCalledTimes(2);
  expect(onBlock).toHaveBeenNthCalledWith(
    2,
    expect.objectContaining({ number: 2n }),
    undefined,
  );

  unwatch();
});

it("unwatch stops polling", async () => {
  let blockNum = 1;
  const request = vi.fn(async () => rpcBlock(blockNum++));
  const onBlock = vi.fn(async () => {});

  const unwatch = watchBlocksAsync(fakeClient(request), {
    onBlock,
    pollingInterval: INTERVAL,
  });

  await vi.advanceTimersByTimeAsync(INTERVAL);
  expect(onBlock).toHaveBeenCalledTimes(1);

  unwatch();

  await vi.advanceTimersByTimeAsync(INTERVAL * 10);
  expect(onBlock).toHaveBeenCalledTimes(1);
});

it("uses client.pollingInterval as default", async () => {
  let blockNum = 1;
  const request = vi.fn(async () => rpcBlock(blockNum++));
  const onBlock = vi.fn(async () => {});

  const unwatch = watchBlocksAsync(fakeClient(request), { onBlock });

  // viem's default pollingInterval is 4000ms
  await vi.advanceTimersByTimeAsync(3999);
  expect(onBlock).not.toHaveBeenCalled();

  await vi.advanceTimersByTimeAsync(1);
  expect(onBlock).toHaveBeenCalledTimes(1);

  unwatch();
});
