import { encodeAbiParameters, encodeFunctionData, getAddress } from "viem";
import { describe, expect, it } from "vitest";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import { AssetsMap } from "../../../utils/AssetsMap.js";
import { iAaveHorizonBridgeAdapterAbi } from "../abi/adapters/index.js";
import { AaveHorizonBridgeAdapterContract } from "./AaveHorizonBridgeAdapterContract.js";

const ADAPTER = getAddress("0x1a1C874cCFE034cfb1437c86755d520293A17e27");
const CREDIT_MANAGER = getAddress("0xBAdfE155662646A1A668c00276220B02FB7f1b23");
const BRIDGE = getAddress("0x805CcC01428CE2F4d3ED23F96c2837393172CDb1");
const A_RWA = getAddress("0x7433806912Eae67919e66aea853d46Fa0aef98A8");
const USDC = getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
const OTHER = getAddress("0x238a700eD6165261Cf8b2e544ba797BC11e466Ba");

function bridgeAdapter(): AaveHorizonBridgeAdapterContract {
  return new AaveHorizonBridgeAdapterContract({} as unknown as OnchainSDK, {
    baseParams: {
      addr: ADAPTER,
      version: 311n,
      contractType: "ADAPTER::AAVE_HORIZON_BRIDGE",
      serializedParams: encodeAbiParameters(
        [
          { type: "address" },
          { type: "address" },
          { type: "address" },
          { type: "address[]" },
          { type: "address[]" },
        ],
        [CREDIT_MANAGER, BRIDGE, BRIDGE, [A_RWA], [USDC]],
      ),
    },
  });
}

const openPosition = (aTokenAmount: bigint, borrowAmount: bigint) =>
  encodeFunctionData({
    abi: iAaveHorizonBridgeAdapterAbi,
    functionName: "openPosition",
    args: [A_RWA, USDC, aTokenAmount, borrowAmount],
  });

describe("AaveHorizonBridgeAdapterContract — serialized params and calls", () => {
  it("decodes the bridge and both allowlists", () => {
    const adapter = bridgeAdapter();

    expect(adapter.creditManager).toBe(CREDIT_MANAGER);
    expect(adapter.bridge).toBe(BRIDGE);
    expect(adapter.allowedATokens).toEqual([A_RWA]);
    expect(adapter.allowedDebtTokens).toEqual([USDC]);
    expect(adapter.isATokenAllowed(A_RWA.toLowerCase() as `0x${string}`)).toBe(
      true,
    );
    expect(adapter.isATokenAllowed(OTHER)).toBe(false);
    expect(adapter.isDebtTokenAllowed(USDC)).toBe(true);
    expect(adapter.isDebtTokenAllowed(A_RWA)).toBe(false);
  });

  it("openPositionCall targets the adapter with all four arguments", () => {
    expect(bridgeAdapter().openPositionCall(A_RWA, USDC, 100n, 50n)).toEqual({
      target: ADAPTER,
      callData: openPosition(100n, 50n),
    });
  });
});

describe("AaveHorizonBridgeAdapterContract.replayOutOfBracketCall", () => {
  it("openPosition: the aTokens leave, the borrowed debt token arrives", () => {
    const balances = new AssetsMap([[A_RWA, 100n]]);

    expect(
      bridgeAdapter().replayOutOfBracketCall(balances, openPosition(100n, 50n)),
    ).toBe(true);
    expect(balances.getOrZero(A_RWA)).toBe(0n);
    expect(balances.getOrZero(USDC)).toBe(50n);
  });

  it("closePosition: the repayment leaves, the aTokens come back", () => {
    const balances = new AssetsMap([[USDC, 80n]]);
    const calldata = encodeFunctionData({
      abi: iAaveHorizonBridgeAdapterAbi,
      functionName: "closePosition",
      args: [A_RWA, USDC, 50n, 100n],
    });

    expect(bridgeAdapter().replayOutOfBracketCall(balances, calldata)).toBe(
      true,
    );
    expect(balances.getOrZero(USDC)).toBe(30n);
    expect(balances.getOrZero(A_RWA)).toBe(100n);
  });

  it("anything else is not legal outside a bracket", () => {
    const calldata = encodeFunctionData({
      abi: iAaveHorizonBridgeAdapterAbi,
      functionName: "setATokenStatusBatch",
      args: [[{ token: A_RWA, allowed: false }]],
    });

    expect(
      bridgeAdapter().replayOutOfBracketCall(new AssetsMap(), calldata),
    ).toBe(false);
  });
});
