import { type Address, encodeFunctionData, type Hex, zeroAddress } from "viem";
import { expect, it } from "vitest";
import { ierc4626AdapterAbi } from "../../abi/ierc4626Adapter.js";
import type { ERC4626AdapterContract } from "../../plugins/adapters/index.js";
import { type Asset, AssetsMap } from "../../sdk/index.js";
import { applyRWAWrapUnwrap } from "./applyRWAWrapUnwrap.js";

// RWA vault share token (the market underlying) and its ERC4626 asset.
const SHARE: Address = "0x50A9C808cd114E8fEA72f03aE2B1A8825677D56D";
const ASSET: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

/**
 * Minimal adapter stub: the helper only reads `asset` and `share`.
 */
const adapter = { asset: ASSET, share: SHARE } as ERC4626AdapterContract;

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

function apply(calldata: Hex, initialBalances: Asset[]): AssetsMap {
  const balances = new AssetsMap(initialBalances);
  applyRWAWrapUnwrap(adapter, calldata, balances);
  return balances;
}

it("deposit: converts the calldata asset amount into shares 1:1", () => {
  const balances = apply(encode("deposit", 100n), [
    { token: ASSET, balance: 500n },
  ]);

  expect(balances.get(ASSET)).toBe(400n);
  expect(balances.get(SHARE)).toBe(100n);
});

it("redeem: converts the calldata share amount into assets 1:1", () => {
  const balances = apply(encode("redeem", 50n), [
    { token: SHARE, balance: 200n },
  ]);

  expect(balances.get(SHARE)).toBe(150n);
  expect(balances.get(ASSET)).toBe(50n);
});

it("depositDiff: spends the running asset balance down to the leftover", () => {
  const balances = apply(encode("depositDiff", 1n), [
    { token: ASSET, balance: 101n },
  ]);

  expect(balances.get(ASSET)).toBe(1n);
  expect(balances.get(SHARE)).toBe(100n);
});

it("redeemDiff: spends the running share balance down to the leftover", () => {
  const balances = apply(encode("redeemDiff", 1n), [
    { token: SHARE, balance: 201n },
  ]);

  expect(balances.get(SHARE)).toBe(1n);
  expect(balances.get(ASSET)).toBe(200n);
});

it("diff call with running balance at or below the leftover changes nothing", () => {
  const balances = apply(encode("redeemDiff", 10n), [
    { token: SHARE, balance: 7n },
  ]);

  expect(balances.get(SHARE)).toBe(7n);
  expect(balances.get(ASSET)).toBeUndefined();
});

it("ignores adapter functions that are not RWA wrap/unwrap", () => {
  const balances = apply(encode("mint", 100n), [
    { token: ASSET, balance: 500n },
  ]);

  expect(balances.get(ASSET)).toBe(500n);
  expect(balances.get(SHARE)).toBeUndefined();
});
