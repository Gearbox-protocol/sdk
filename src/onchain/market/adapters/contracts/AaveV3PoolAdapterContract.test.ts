import {
  encodeAbiParameters,
  encodeFunctionData,
  getAddress,
  zeroAddress,
} from "viem";
import { describe, expect, it, vi } from "vitest";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import { AssetsMap } from "../../../utils/AssetsMap.js";
import { iAaveV3PoolAdapterAbi } from "../abi/adapters/index.js";
import { AaveV3PoolAdapterContract } from "./AaveV3PoolAdapterContract.js";

const ADAPTER = getAddress("0x1a1C874cCFE034cfb1437c86755d520293A17e27");
const CREDIT_MANAGER = getAddress("0xBAdfE155662646A1A668c00276220B02FB7f1b23");
const POOL = getAddress("0x805CcC01428CE2F4d3ED23F96c2837393172CDb1");
const RWA = getAddress("0x238a700eD6165261Cf8b2e544ba797BC11e466Ba");
const A_RWA = getAddress("0x7433806912Eae67919e66aea853d46Fa0aef98A8");
const OTHER = getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");

function poolAdapter(): {
  adapter: AaveV3PoolAdapterContract;
  readContract: ReturnType<typeof vi.fn>;
} {
  const readContract = vi.fn(async () => A_RWA);
  const adapter = new AaveV3PoolAdapterContract(
    { client: { readContract } } as unknown as OnchainSDK,
    {
      baseParams: {
        addr: ADAPTER,
        version: 311n,
        contractType: "ADAPTER::AAVE_V3_POOL",
        serializedParams: encodeAbiParameters(
          [
            { type: "address" },
            { type: "address" },
            { type: "address" },
            { type: "uint16" },
            { type: "address[]" },
          ],
          [CREDIT_MANAGER, POOL, POOL, 7, [RWA]],
        ),
      },
    },
  );
  return { adapter, readContract };
}

const call = (
  functionName: "supply" | "withdraw",
  amount: bigint,
): `0x${string}` =>
  functionName === "supply"
    ? encodeFunctionData({
        abi: iAaveV3PoolAdapterAbi,
        functionName,
        args: [RWA, amount, zeroAddress, 0],
      })
    : encodeFunctionData({
        abi: iAaveV3PoolAdapterAbi,
        functionName,
        args: [RWA, amount, zeroAddress],
      });

const diffCall = (
  functionName: "supplyDiff" | "withdrawDiff",
  leftoverAmount: bigint,
): `0x${string}` =>
  encodeFunctionData({
    abi: iAaveV3PoolAdapterAbi,
    functionName,
    args: [RWA, leftoverAmount],
  });

describe("AaveV3PoolAdapterContract — serialized params and calls", () => {
  it("decodes pool, referral code and the assets it lists", () => {
    const { adapter } = poolAdapter();

    expect(adapter.creditManager).toBe(CREDIT_MANAGER);
    expect(adapter.targetContract).toBe(POOL);
    expect(adapter.pool).toBe(POOL);
    expect(adapter.referralCode).toBe(7);
    expect(adapter.allowedAssets).toEqual([RWA]);
    expect(adapter.isAssetAllowed(RWA.toLowerCase() as `0x${string}`)).toBe(
      true,
    );
    expect(adapter.isAssetAllowed(OTHER)).toBe(false);
  });

  it("supplyDiffCall targets the adapter with the asset and the leftover", () => {
    const { adapter } = poolAdapter();

    expect(adapter.supplyDiffCall(RWA, 0n)).toEqual({
      target: ADAPTER,
      callData: diffCall("supplyDiff", 0n),
    });
  });

  it("reads a reserve's aToken from the pool once", async () => {
    const { adapter, readContract } = poolAdapter();

    expect(await adapter.aToken(RWA)).toBe(A_RWA);
    expect(await adapter.aToken(RWA)).toBe(A_RWA);
    expect(readContract).toHaveBeenCalledTimes(1);
    expect(readContract.mock.calls[0][0]).toMatchObject({
      address: POOL,
      functionName: "getReserveAToken",
      args: [RWA],
    });
  });
});

describe("AaveV3PoolAdapterContract.replayOutOfBracketCall", () => {
  it("refuses to replay before the aToken has been loaded", () => {
    const { adapter } = poolAdapter();

    expect(() =>
      adapter.replayOutOfBracketCall(
        new AssetsMap([[RWA, 100n]]),
        call("supply", 100n),
      ),
    ).toThrowError(/not loaded/);
  });

  it("supply: the asset becomes its aToken one for one", async () => {
    const { adapter } = poolAdapter();
    const calldata = call("supply", 60n);
    await adapter.loadReplayState(calldata);
    const balances = new AssetsMap([[RWA, 100n]]);

    expect(adapter.replayOutOfBracketCall(balances, calldata)).toBe(true);
    expect(balances.getOrZero(RWA)).toBe(40n);
    expect(balances.getOrZero(A_RWA)).toBe(60n);
  });

  it("supplyDiff: everything above the leftover is supplied", async () => {
    const { adapter } = poolAdapter();
    const calldata = diffCall("supplyDiff", 1n);
    await adapter.loadReplayState(calldata);
    const balances = new AssetsMap([[RWA, 100n]]);

    expect(adapter.replayOutOfBracketCall(balances, calldata)).toBe(true);
    expect(balances.getOrZero(RWA)).toBe(1n);
    expect(balances.getOrZero(A_RWA)).toBe(99n);
  });

  it("withdraw and withdrawDiff: the aToken becomes the asset again", async () => {
    const { adapter } = poolAdapter();
    await adapter.loadReplayState(call("withdraw", 30n));
    const balances = new AssetsMap([[A_RWA, 100n]]);

    expect(
      adapter.replayOutOfBracketCall(balances, call("withdraw", 30n)),
    ).toBe(true);
    expect(balances.getOrZero(A_RWA)).toBe(70n);
    expect(balances.getOrZero(RWA)).toBe(30n);

    expect(
      adapter.replayOutOfBracketCall(balances, diffCall("withdrawDiff", 0n)),
    ).toBe(true);
    expect(balances.getOrZero(A_RWA)).toBe(0n);
    expect(balances.getOrZero(RWA)).toBe(100n);
  });

  it("anything else is not legal outside a bracket", () => {
    const { adapter } = poolAdapter();
    const calldata = encodeFunctionData({
      abi: iAaveV3PoolAdapterAbi,
      functionName: "setAssetStatusBatch",
      args: [[{ asset: RWA, allowed: true }]],
    });

    expect(adapter.replayOutOfBracketCall(new AssetsMap(), calldata)).toBe(
      false,
    );
  });

  it("loadReplayState leaves calldata it cannot decode to the replay", async () => {
    const { adapter, readContract } = poolAdapter();

    await expect(adapter.loadReplayState("0xdeadbeef")).resolves.toBe(
      undefined,
    );
    expect(readContract).not.toHaveBeenCalled();
  });
});
