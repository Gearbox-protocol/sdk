import {
  type Address,
  encodeAbiParameters,
  encodeFunctionData,
  type Hex,
  zeroAddress,
} from "viem";
import { describe, expect, it } from "vitest";
import { ierc4626AdapterAbi } from "../../../../abi/ierc4626Adapter.js";
import type { Asset } from "../../../base/types.js";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import { AssetsMap } from "../../../utils/index.js";
import { ERC4626AdapterContract } from "./ERC4626AdapterContract.js";

const ADAPTER = "0x1111111111111111111111111111111111111111" as Address;
const CREDIT_MANAGER = "0x5555555555555555555555555555555555555555" as Address;
const SHARE = "0x50A9C808cd114E8fEA72f03aE2B1A8825677D56D" as Address;
const ASSET = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address;

function stubSdk(rwaUnderlyings: Address[] = [SHARE]): OnchainSDK {
  return {
    tokensMeta: {
      get: (address: Address) =>
        rwaUnderlyings.includes(address) ? { addr: address } : undefined,
      isRWAUnderlying: () => true,
    },
  } as unknown as OnchainSDK;
}

function stubRWAAdapter(
  sdk: OnchainSDK,
  rwaShare: Address = SHARE,
  asset: Address = ASSET,
): ERC4626AdapterContract {
  return new ERC4626AdapterContract(sdk, {
    baseParams: {
      addr: ADAPTER,
      version: 310n,
      contractType: "ADAPTER::ERC4626" as `0x${string}`,
      serializedParams: encodeAbiParameters(
        [{ type: "address" }, { type: "address" }, { type: "address" }],
        [CREDIT_MANAGER, rwaShare, asset],
      ),
    },
  });
}

function encode(
  functionName: "deposit" | "depositDiff" | "redeem" | "redeemDiff" | "mint",
  amount: bigint,
): Hex {
  switch (functionName) {
    case "deposit":
    case "mint":
      return encodeFunctionData({
        abi: ierc4626AdapterAbi,
        functionName,
        args: [amount, zeroAddress],
      });
    case "redeem":
      return encodeFunctionData({
        abi: ierc4626AdapterAbi,
        functionName,
        args: [amount, zeroAddress, zeroAddress],
      });
    case "depositDiff":
    case "redeemDiff":
      return encodeFunctionData({
        abi: ierc4626AdapterAbi,
        functionName,
        args: [amount],
      });
  }
}

function replay(
  adapter: ERC4626AdapterContract,
  calldata: Hex,
  initialBalances: Asset[],
): AssetsMap {
  const balances = new AssetsMap(initialBalances);
  adapter.replayOutOfBracketCall(balances, calldata);
  return balances;
}

describe("ERC4626AdapterContract.replayOutOfBracketCall", () => {
  it("deposit: converts the calldata asset amount into shares 1:1", () => {
    const adapter = stubRWAAdapter(stubSdk());
    const balances = replay(adapter, encode("deposit", 100n), [
      { token: ASSET, balance: 500n },
    ]);

    expect(balances.get(ASSET)).toBe(400n);
    expect(balances.get(SHARE)).toBe(100n);
  });

  it("redeem: converts the calldata share amount into assets 1:1", () => {
    const adapter = stubRWAAdapter(stubSdk());
    const balances = replay(adapter, encode("redeem", 50n), [
      { token: SHARE, balance: 200n },
    ]);

    expect(balances.get(SHARE)).toBe(150n);
    expect(balances.get(ASSET)).toBe(50n);
  });

  it("depositDiff: spends the running asset balance down to the leftover", () => {
    const adapter = stubRWAAdapter(stubSdk());
    const balances = replay(adapter, encode("depositDiff", 1n), [
      { token: ASSET, balance: 101n },
    ]);

    expect(balances.get(ASSET)).toBe(1n);
    expect(balances.get(SHARE)).toBe(100n);
  });

  it("redeemDiff: spends the running share balance down to the leftover", () => {
    const adapter = stubRWAAdapter(stubSdk());
    const balances = replay(adapter, encode("redeemDiff", 1n), [
      { token: SHARE, balance: 201n },
    ]);

    expect(balances.get(SHARE)).toBe(1n);
    expect(balances.get(ASSET)).toBe(200n);
  });

  it("diff call with running balance at or below the leftover changes nothing", () => {
    const adapter = stubRWAAdapter(stubSdk());
    const balances = replay(adapter, encode("redeemDiff", 10n), [
      { token: SHARE, balance: 7n },
    ]);

    expect(balances.get(SHARE)).toBe(7n);
    expect(balances.get(ASSET)).toBeUndefined();
  });

  it("ignores adapter functions that are not RWA wrap/unwrap", () => {
    const adapter = stubRWAAdapter(stubSdk());
    const balances = replay(adapter, encode("mint", 100n), [
      { token: ASSET, balance: 500n },
    ]);

    expect(balances.get(ASSET)).toBe(500n);
    expect(balances.get(SHARE)).toBeUndefined();
  });

  it("returns false for a non-RWA underlying share", () => {
    const adapter = stubRWAAdapter(stubSdk([]));
    const balances = new AssetsMap([{ token: ASSET, balance: 500n }]);
    expect(
      adapter.replayOutOfBracketCall(balances, encode("deposit", 100n)),
    ).toBe(false);
    expect(balances.get(ASSET)).toBe(500n);
  });
});
