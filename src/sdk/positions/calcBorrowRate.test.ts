import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type { Token } from "../../model/index.js";
import { bpsToRay } from "../market/math.js";
import { calcBorrowRate } from "./calcBorrowRate.js";
import type { AccountSnapshot } from "./types.js";

const WETH =
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase() as Address;
const DAI =
  "0x6B175474E89094C44Da98b954EedeAC495271d0F".toLowerCase() as Address;

// 2% base rate in ray
const baseInterestRate = 2n * 10n ** 25n;

function resolveToken(address: Address): Token {
  return {
    chainId: 1,
    address,
    symbol: "TOKEN",
    name: "TOKEN",
    decimals: 18,
  };
}

function snapshot(partial: Partial<AccountSnapshot>): AccountSnapshot {
  return {
    creditManager: DAI,
    assets: [],
    quotas: [],
    totalDebt: 0n,
    totalValue: 0n,
    ...partial,
  };
}

describe("calcBorrowRate", () => {
  it("breaks the rate down into base and per-token quotas", () => {
    const result = calcBorrowRate({
      snapshot: snapshot({
        totalDebt: 5n,
        totalValue: 10n,
        quotas: [{ token: WETH, balance: 100n }],
      }),
      baseInterestRate,
      feeInterest: 0,
      quotaRates: { [WETH]: 5 },
      resolveToken,
    });

    expect(result.base).toBe(200);
    // quota: 100 * 5 = 500; total = 5*200/10 + 500/10; totalOnDebt = 200 + 500/5
    expect(result.quotas).toEqual([
      { token: expect.objectContaining({ address: WETH }), rate: 50 },
    ]);
    expect(result.total).toBe(150);
    expect(result.totalOnDebt).toBe(300);
  });

  it("applies the interest fee to quota rates but not to the truncation parity base", () => {
    const result = calcBorrowRate({
      snapshot: snapshot({
        totalDebt: 5n,
        totalValue: 10n,
        quotas: [{ token: WETH, balance: 100n }],
      }),
      baseInterestRate,
      feeInterest: 500,
      quotaRates: { [WETH]: 333 },
      resolveToken,
    });

    // base = 200 * 1.05 = 210
    expect(result.base).toBe(210);
    // rateBalance = 100 * 333 = 33300; with fee: 33300 * 1.05 = 34965
    expect(result.quotas).toEqual([
      { token: expect.objectContaining({ address: WETH }), rate: 3496 },
    ]);
    // total = 5*210/10 + 34965/10; totalOnDebt = 210 + 34965/5
    expect(result.total).toBe(105 + 3496);
    expect(result.totalOnDebt).toBe(210 + 6993);
  });

  it("reports zero quota contribution for an inactive quota", () => {
    const result = calcBorrowRate({
      snapshot: snapshot({
        totalDebt: 5n,
        totalValue: 10n,
        quotas: [{ token: WETH, balance: 100n }],
      }),
      baseInterestRate,
      feeInterest: 0,
      quotaRates: {},
      resolveToken,
    });

    expect(result.quotas).toEqual([
      { token: expect.objectContaining({ address: WETH }), rate: 0 },
    ]);
    expect(result.total).toBe(100);
    expect(result.totalOnDebt).toBe(200);
  });

  it("skips leftover quotas at or below the dust threshold", () => {
    const result = calcBorrowRate({
      snapshot: snapshot({
        totalDebt: 5n,
        totalValue: 10n,
        quotas: [{ token: WETH, balance: 10n }],
      }),
      baseInterestRate,
      feeInterest: 0,
      quotaRates: { [WETH]: 5 },
      resolveToken,
    });

    expect(result.quotas).toEqual([]);
    expect(result.total).toBe(100);
    expect(result.totalOnDebt).toBe(200);
  });

  it("reports zeros when there is nothing to normalize against", () => {
    const result = calcBorrowRate({
      snapshot: snapshot({
        totalDebt: 0n,
        totalValue: 0n,
        quotas: [{ token: WETH, balance: 100n }],
      }),
      baseInterestRate,
      feeInterest: 0,
      quotaRates: { [WETH]: 5 },
      resolveToken,
    });

    expect(result).toEqual({
      total: 0,
      totalOnDebt: 0,
      base: 200,
      quotas: [{ token: expect.objectContaining({ address: WETH }), rate: 0 }],
    });
  });

  it("charges the interest fee on whichever base rate it is handed", () => {
    // a projection hands over the rate its post-operation utilization implies,
    // in the same ray the pool reports its own in — there is no second path
    const result = calcBorrowRate({
      snapshot: snapshot({ totalDebt: 100n, totalValue: 200n }),
      baseInterestRate: bpsToRay(400),
      feeInterest: 5000,
      quotaRates: {},
      resolveToken,
    });

    // 4% × 1.5
    expect(result.base).toBe(600);
    expect(result.totalOnDebt).toBe(600);
  });
});
