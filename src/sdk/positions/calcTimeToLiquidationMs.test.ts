import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import { PRICE_DECIMALS_POW, toBN } from "../index.js";
import { calcBorrowRate } from "./calcBorrowRate.js";
import { calcHealthFactor } from "./calcHealthFactor.js";
import { calcTimeToLiquidationMs } from "./calcTimeToLiquidationMs.js";
import type { AccountSnapshot } from "./types.js";

describe("calcTimeToLiquidationMs", () => {
  it("takes the rate in Bps (10000 = 100%), same scale as HF", () => {
    expect(calcTimeToLiquidationMs(9000, 250n)).toBe(null);
    expect(calcTimeToLiquidationMs(9000, 0n)).toBe(null);
    // HF 1.375, 20% APR (2000 bps) -> ~684.4 days
    expect(calcTimeToLiquidationMs(13750, 2000n)).toBe(59130000n * 1000n);
  });

  it("returns null when the debt carries no rate", () => {
    expect(calcTimeToLiquidationMs(10244, 0n)).toBe(null);
  });
});

/**
 * Regression for PR #486 (d044f8f4): `calcHealthFactor` and `calcBorrowRate`
 * both report `Bps` (10000 = 100%), but `calcTimeToLiquidationMs` shipped
 * with a formula still expecting the legacy `PERCENTAGE_FACTOR_1KK`
 * (1_000_000 = 100%) scale `totalOnDebt` used to carry pre-rewrite — the two
 * are indistinguishable when each function is unit-tested with its own
 * hand-picked numbers, only when `calcBorrowRate`'s actual output is fed
 * straight into `calcTimeToLiquidationMs` (as `PositionsService.timeToLiquidation`
 * does) does the 100x error surface. Pins the composed, real-callsite result
 * so a future scale change on either side of the seam fails loudly here.
 **/
describe("calcTimeToLiquidationMs composed with calcHealthFactor + calcBorrowRate", () => {
  const WETH =
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase() as Address;
  const DAI =
    "0x6B175474E89094C44Da98b954EedeAC495271d0F".toLowerCase() as Address;

  const decimals = { [WETH]: 18, [DAI]: 18 };
  const prices = {
    [WETH]: toBN("1738.11830000", PRICE_DECIMALS_POW),
    [DAI]: toBN("0.99941103", PRICE_DECIMALS_POW),
  };
  const liquidationThresholds = { [WETH]: 8500, [DAI]: 9300 };

  // Same snapshot handed to both calcHealthFactor and calcBorrowRate, exactly
  // as PositionsService.timeToLiquidation does — the composition is the point.
  const snapshot: AccountSnapshot = {
    creditManager: DAI,
    assets: [
      { balance: toBN("156552", 18), token: DAI },
      { balance: toBN("10", 18), token: WETH },
    ],
    quotas: [{ balance: toBN(String(1750 * 10), 18), token: WETH }],
    totalDebt: toBN("156552", 18),
    totalValue: toBN("156552", 18),
  };

  it("stays in the days-to-months range for a near-liquidatable position, not centuries", () => {
    const hf = calcHealthFactor({
      snapshot,
      underlying: DAI,
      decimals,
      prices,
      liquidationThresholds,
      activeQuotas: { [WETH]: true },
    });
    const borrowRate = calcBorrowRate({
      snapshot,
      baseInterestRate: 5n * 10n ** 25n, // 5% base APR in ray
      feeInterest: 1000, // 10% protocol fee
      quotaRates: { [WETH]: 200 }, // 2% quota rate
      resolveToken: address => ({
        chainId: 1,
        address,
        symbol: "TOKEN",
        name: "TOKEN",
        decimals: 18,
      }),
    });

    expect(hf).toBe(10244); // HF 1.0244 — barely above liquidation
    expect(borrowRate.totalOnDebt).toBe(574); // 5.74% effective APR on the debt

    const ttlMs = calcTimeToLiquidationMs(hf, BigInt(borrowRate.totalOnDebt));

    // A 100x scale bug (Bps fed where PERCENTAGE_FACTOR_1KK was expected, or
    // vice versa) would push this to ~15,500 days (~42 years) or ~1.5 days.
    expect(ttlMs).toBe(13405547026n);
    const ttlDays = Number(ttlMs) / 1000 / 60 / 60 / 24;
    expect(ttlDays).toBeGreaterThan(100);
    expect(ttlDays).toBeLessThan(365);
  });
});
