import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import { type Asset, toBN } from "../index.js";
import { calcLiquidationPrice } from "./calcLiquidationPrice.js";
import type { AccountSnapshot } from "./types.js";

const WETH =
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase() as Address;
const DAI =
  "0x6B175474E89094C44Da98b954EedeAC495271d0F".toLowerCase() as Address;
const USDC =
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48".toLowerCase() as Address;
const STETH =
  "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84".toLowerCase() as Address;

const decimals = { [WETH]: 18, [DAI]: 18, [USDC]: 6, [STETH]: 18 };
const liquidationThresholds = {
  [USDC]: 9800,
  [DAI]: 9300,
  [WETH]: 8500,
  [STETH]: 8000,
};

const LP_ASSETS: Asset[] = [
  { token: USDC, balance: toBN("10000", 6) },
  { token: WETH, balance: toBN("25", 18) },
];

function snapshot(partial: Partial<AccountSnapshot> = {}): AccountSnapshot {
  return {
    creditManager: USDC,
    assets: LP_ASSETS,
    quotas: [],
    totalDebt: toBN("40000", 6),
    totalValue: toBN("40000", 6),
    ...partial,
  };
}

function price(snap: Partial<AccountSnapshot> = {}) {
  return calcLiquidationPrice({
    snapshot: snapshot(snap),
    underlying: USDC,
    decimals,
    liquidationThresholds,
  });
}

describe("calcLiquidationPrice", () => {
  it("computes the price for a single non-underlying target", () => {
    // effectiveDebt = (40000e6 - 10000e6 * 0.98) * 1e12 = 30200e6 * 1e12
    // price = effectiveDebt * 1e8 * 10000 / (25e18 * 8500)
    const effectiveDebt = (toBN("40000", 6) - toBN("9800", 6)) * 10n ** 12n;
    const expected =
      (effectiveDebt * 10n ** 8n * 10000n) / (toBN("25", 18) * 8500n);
    expect(price()).toBe(expected);
    expect(expected).toBeGreaterThan(0n);
  });

  it("returns null with zero non-underlying assets", () => {
    expect(
      price({ assets: [{ token: USDC, balance: toBN("10000", 6) }] }),
    ).toBe(null);
  });

  it("ignores leftover non-underlying when picking the target", () => {
    expect(
      price({
        assets: [...LP_ASSETS, { token: STETH, balance: 10n }],
      }),
    ).toBe(price());
  });

  it("returns null with two non-underlying assets", () => {
    expect(
      price({
        assets: [...LP_ASSETS, { token: STETH, balance: toBN("5", 18) }],
      }),
    ).toBe(null);
  });
});
