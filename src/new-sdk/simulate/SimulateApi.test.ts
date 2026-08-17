import { describe, expect, it, vi } from "vitest";
import type { MultichainSDK } from "../../sdk/index.js";
import { onchainOnly } from "./SimulateApi.js";

const CHAIN_ID = 1;
const BLOCK = 20_000_000n;
const TIMESTAMP = 1_719_792_000;

function fakeMultichain(): MultichainSDK {
  return {
    chain: vi.fn(() => ({ currentBlock: BLOCK, timestamp: TIMESTAMP })),
  } as unknown as MultichainSDK;
}

describe("onchainOnly", () => {
  it("wraps a successful read in the envelope, naming the block it ran on", async () => {
    const run = onchainOnly(fakeMultichain());

    const response = await run("simulate", CHAIN_ID, async () => 42);

    expect(response).toEqual({
      data: 42,
      meta: {
        chains: [
          {
            chainId: CHAIN_ID,
            status: "success",
            source: "onchain",
            blockNumber: Number(BLOCK),
            timestamp: TIMESTAMP,
          },
        ],
      },
    });
  });

  it("resolves a throwing chain as that chain's error entry rather than rejecting", async () => {
    const boom = new Error("rpc down");
    const warn = vi.fn();
    const run = onchainOnly(fakeMultichain(), {
      warn,
      debug: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
    } as never);

    const response = await run("simulate", CHAIN_ID, async () => {
      throw boom;
    });

    expect(response.meta.chains).toEqual([
      { chainId: CHAIN_ID, status: "error", source: "onchain", error: boom },
    ]);
    expect(response.data).toBeUndefined();
    expect(warn).toHaveBeenCalledOnce();
  });

  it("throws when the SDK has no onchain source at all", async () => {
    const run = onchainOnly(undefined);

    await expect(run("simulate", CHAIN_ID, async () => 1)).rejects.toThrow(
      /without an onchain source/,
    );
  });
});
