import type { Address, Hex } from "viem";
import { encodeFunctionData } from "viem";
import { describe, expect, it } from "vitest";
import { iAaveHorizonBridgeAdapterAbi } from "../../market/adapters/abi/adapters/index.js";
import { AaveHorizonBridgeAdapterContract } from "../../market/adapters/contracts/AaveHorizonBridgeAdapterContract.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import type { InnerOperation } from "../parse/index.js";
import { aaveBridgeBorrows } from "./aaveBridgeBorrows.js";

const CREDIT_MANAGER = "0x0000000000000000000000000000000000000c00" as Address;
const ADAPTER = "0x0000000000000000000000000000000000000a00" as Address;
const BRIDGE = "0x0000000000000000000000000000000000000b00" as Address;
const OTHER = "0x0000000000000000000000000000000000000d00" as Address;
const UND = "0x0000000000000000000000000000000000000001" as Address;
const A_RWA = "0x0000000000000000000000000000000000000003" as Address;

function stubSdk(contracts: Record<Address, unknown>): OnchainSDK {
  return {
    getContract: (address: Address) => contracts[address],
    marketRegister: {
      findByCreditManager: () => ({
        priceOracle: {
          toTokenAmount: (token: Address, value: bigint) => ({ token, value }),
        },
      }),
    },
  } as unknown as OnchainSDK;
}

function bridgeAdapter(): AaveHorizonBridgeAdapterContract {
  return Object.create(AaveHorizonBridgeAdapterContract.prototype, {
    bridge: { value: BRIDGE },
  });
}

function execute(adapter: Address, calldata: Hex): InnerOperation {
  return {
    operation: "Execute",
    adapter,
    adapterType: "ADAPTER::AAVE_HORIZON_BRIDGE",
    version: 311,
    adapterFunctionName: "openPositionDiff",
    adapterArgs: {},
    calldata,
  };
}

const call = (
  functionName: "openPosition" | "openPositionDiff" | "closePosition",
  amount: bigint,
): Hex =>
  encodeFunctionData({
    abi: iAaveHorizonBridgeAdapterAbi,
    functionName,
    args: [A_RWA, UND, 0n, amount],
  });

describe("aaveBridgeBorrows", () => {
  it("reports what the opening calls borrow, against their bridge", () => {
    const sdk = stubSdk({ [ADAPTER]: bridgeAdapter() });
    expect(
      aaveBridgeBorrows(sdk, CREDIT_MANAGER, [
        execute(ADAPTER, call("openPositionDiff", 1_001n)),
        execute(ADAPTER, call("openPosition", 5n)),
      ]),
    ).toEqual([
      { bridge: BRIDGE, amount: { token: UND, value: 1_001n } },
      { bridge: BRIDGE, amount: { token: UND, value: 5n } },
    ]);
  });

  it("skips a closing call, another adapter and non-Execute ops", () => {
    const sdk = stubSdk({ [ADAPTER]: bridgeAdapter(), [OTHER]: {} });
    expect(
      aaveBridgeBorrows(sdk, CREDIT_MANAGER, [
        execute(ADAPTER, call("closePosition", 1_001n)),
        execute(OTHER, call("openPositionDiff", 1_001n)),
        { operation: "AddCollateral", token: UND, amount: 1n },
      ]),
    ).toEqual([]);
  });
});
