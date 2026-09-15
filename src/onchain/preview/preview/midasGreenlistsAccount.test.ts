import type { Address, Hex } from "viem";
import { encodeFunctionData, getAddress } from "viem";
import { describe, expect, it } from "vitest";
import { iMidasGatewayAdapterV311Abi } from "../../market/adapters/abi/adapters/iMidasGatewayAdapterV311.js";
import { MidasGatewayAdapterContract } from "../../market/adapters/contracts/MidasGatewayAdapterContract.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import type { InnerOperation } from "../parse/index.js";
import { midasGreenlistsAccount } from "./midasGreenlistsAccount.js";

const GATEWAY = getAddress("0x27792659F19d15bd6e48e6f4649585E9e49E68D6");
const OTHER = getAddress("0x1111111111111111111111111111111111111111");
const USDC = getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");

const RECEIVE_GREENLIST = encodeFunctionData({
  abi: iMidasGatewayAdapterV311Abi,
  functionName: "receiveGreenlist",
});

const REDEEM_REQUEST = encodeFunctionData({
  abi: iMidasGatewayAdapterV311Abi,
  functionName: "redeemRequest",
  args: [1n],
});

function stubGateway(): MidasGatewayAdapterContract {
  return Object.create(MidasGatewayAdapterContract.prototype);
}

function stubSdk(contracts: Record<Address, unknown> = {}): OnchainSDK {
  return {
    getContract: (address: Address) => contracts[address],
  } as unknown as OnchainSDK;
}

function execute(adapter: Address, calldata: Hex): InnerOperation {
  return {
    operation: "Execute",
    adapter,
    adapterType: "ADAPTER::MIDAS_GATEWAY",
    version: 311,
    adapterFunctionName: "receiveGreenlist",
    adapterArgs: {},
    calldata,
  };
}

describe("midasGreenlistsAccount", () => {
  it("is true when the multicall includes receiveGreenlist on a Midas gateway adapter", () => {
    const sdk = stubSdk({ [GATEWAY]: stubGateway() });
    expect(
      midasGreenlistsAccount(sdk, [execute(GATEWAY, RECEIVE_GREENLIST)]),
    ).toBe(true);
  });

  it("is false when the Midas gateway call is not receiveGreenlist", () => {
    const sdk = stubSdk({ [GATEWAY]: stubGateway() });
    expect(
      midasGreenlistsAccount(sdk, [execute(GATEWAY, REDEEM_REQUEST)]),
    ).toBe(false);
  });

  it("is false when the target is not a Midas gateway adapter", () => {
    const sdk = stubSdk({ [OTHER]: {} });
    expect(
      midasGreenlistsAccount(sdk, [execute(OTHER, RECEIVE_GREENLIST)]),
    ).toBe(false);
  });

  it("is false when the multicall has no Execute ops", () => {
    expect(
      midasGreenlistsAccount(stubSdk(), [
        { operation: "AddCollateral", token: USDC, amount: 1n },
      ]),
    ).toBe(false);
  });
});
