import { type Address, getAddress, padHex } from "viem";
import { describe, expect, it } from "vitest";
import type { OnchainSDK } from "../../sdk/index.js";
import type { PoolOperation } from "../parse/index.js";
import { simulatePoolOperation } from "./simulatePoolOperation.js";

const addr = (hex: string): Address =>
  getAddress(padHex(hex as Address, { size: 20 }));

const RECEIVER = addr("0xc1");
const OWNER = addr("0x0e");
const POOL = addr("0x90");
const UNDERLYING = addr("0xde");
const ZAPPER = addr("0x2a");
// A zapper's "outside" token, distinct from the pool underlying.
const USDC = addr("0xdc");
// A zapper's share-side token (e.g. a farmed diesel wrapper).
const FARM_TOKEN = addr("0xfa");

interface PreviewCall {
  address: Address;
  functionName: string;
  args: readonly unknown[];
}

/**
 * Fake SDK whose client answers every preview read with `previewAmount` and
 * records the call for assertions.
 */
function fakeSdk(previewAmount: bigint, calls: PreviewCall[]): OnchainSDK {
  return {
    client: {
      readContract: async (params: PreviewCall) => {
        calls.push(params);
        return previewAmount;
      },
    },
  } as unknown as OnchainSDK;
}

function simulate(operation: PoolOperation, previewAmount: bigint) {
  const calls: PreviewCall[] = [];
  const sdk = fakeSdk(previewAmount, calls);
  const result = simulatePoolOperation({
    sdk,
    operation,
    to: operation.zapper ?? operation.pool,
    calldata: "0x",
  });
  return { result, calls };
}

describe("simulatePoolOperation", () => {
  it("Deposit: amountIn from calldata, amountOut from previewDeposit", async () => {
    const op: PoolOperation = {
      operation: "Deposit",
      pool: POOL,
      receiver: RECEIVER,
      assets: 100n,
      underlying: UNDERLYING,
      tokenIn: UNDERLYING,
      tokenOut: POOL,
      zapper: undefined,
    };
    const { result, calls } = simulate(op, 90n);

    await expect(result).resolves.toEqual({
      status: "success",
      amountIn: 100n,
      amountOut: 90n,
    });
    expect(calls).toMatchObject([
      { address: POOL, functionName: "previewDeposit", args: [100n] },
    ]);
  });

  it("Mint: amountIn from previewMint, amountOut from calldata", async () => {
    const op: PoolOperation = {
      operation: "Mint",
      pool: POOL,
      receiver: RECEIVER,
      shares: 50n,
      underlying: UNDERLYING,
      tokenIn: UNDERLYING,
      tokenOut: POOL,
      zapper: undefined,
    };
    const { result, calls } = simulate(op, 55n);

    await expect(result).resolves.toEqual({
      status: "success",
      amountIn: 55n,
      amountOut: 50n,
    });
    expect(calls).toMatchObject([
      { address: POOL, functionName: "previewMint", args: [50n] },
    ]);
  });

  it("Withdraw: amountIn from previewWithdraw, amountOut from calldata", async () => {
    const op: PoolOperation = {
      operation: "Withdraw",
      pool: POOL,
      receiver: RECEIVER,
      owner: OWNER,
      assets: 200n,
      underlying: UNDERLYING,
      tokenIn: POOL,
      tokenOut: UNDERLYING,
      zapper: undefined,
    };
    const { result, calls } = simulate(op, 180n);

    await expect(result).resolves.toEqual({
      status: "success",
      amountIn: 180n,
      amountOut: 200n,
    });
    expect(calls).toMatchObject([
      { address: POOL, functionName: "previewWithdraw", args: [200n] },
    ]);
  });

  it("Redeem: amountIn from calldata, amountOut from previewRedeem", async () => {
    const op: PoolOperation = {
      operation: "Redeem",
      pool: POOL,
      receiver: RECEIVER,
      owner: OWNER,
      shares: 120n,
      underlying: UNDERLYING,
      tokenIn: POOL,
      tokenOut: UNDERLYING,
      zapper: undefined,
    };
    const { result, calls } = simulate(op, 130n);

    await expect(result).resolves.toEqual({
      status: "success",
      amountIn: 120n,
      amountOut: 130n,
    });
    expect(calls).toMatchObject([
      { address: POOL, functionName: "previewRedeem", args: [120n] },
    ]);
  });

  it("zapper Deposit reads the zapper's previewDeposit", async () => {
    const op: PoolOperation = {
      operation: "Deposit",
      pool: POOL,
      receiver: RECEIVER,
      assets: 1_000n,
      underlying: UNDERLYING,
      // Zapper-routed: the caller supplies USDC, not the pool underlying,
      // and receives the zapper's share-side token (a farmed diesel wrapper).
      tokenIn: USDC,
      tokenOut: FARM_TOKEN,
      zapper: ZAPPER,
    };
    const { result, calls } = simulate(op, 950n);

    await expect(result).resolves.toEqual({
      status: "success",
      amountIn: 1_000n,
      amountOut: 950n,
    });
    expect(calls).toMatchObject([
      { address: ZAPPER, functionName: "previewDeposit", args: [1_000n] },
    ]);
  });

  it("returns a decoded failure when the preview read reverts", async () => {
    const op: PoolOperation = {
      operation: "Deposit",
      pool: POOL,
      receiver: RECEIVER,
      assets: 100n,
      underlying: UNDERLYING,
      tokenIn: UNDERLYING,
      tokenOut: POOL,
      zapper: undefined,
    };
    const sdk = {
      client: {
        readContract: async () => {
          throw new Error("boom");
        },
      },
    } as unknown as OnchainSDK;

    const result = await simulatePoolOperation({
      sdk,
      operation: op,
      to: POOL,
      calldata: "0x",
    });

    expect(result.status).toBe("failure");
    if (result.status === "failure") {
      expect(result.error.failures[0]?.detail.reason).toBe("boom");
    }
  });
});
