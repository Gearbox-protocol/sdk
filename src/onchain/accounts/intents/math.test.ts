import type { Address } from "viem";
import { describe, expect, it } from "vitest";

import { LEVERAGE_DECIMALS } from "../../constants/math.js";
import {
  assertDebtInBand,
  assertLeverageAtLeastOne,
  debtForLeverage,
  maxProportionalWithdrawal,
  proportionalDebt,
} from "./math.js";
import type { IntentPreviewError } from "./refusal.js";

/** Stand-in underlying: the band's amounts are denominated in it. */
const UND = "0x0000000000000000000000000000000000000001" as Address;

/** The detail of the refusal `debt` draws, for a debt that draws one. */
function inBandDetail(debt: bigint): unknown {
  try {
    assertDebtInBand(debt, BAND, UND);
  } catch (e) {
    return (e as IntentPreviewError).detail;
  }
  throw new Error(`assertDebtInBand accepted ${debt}`);
}

const X1 = LEVERAGE_DECIMALS;
const X2 = 2n * LEVERAGE_DECIMALS;
const X3 = 3n * LEVERAGE_DECIMALS;

const BAND = { minDebt: 100n, maxDebt: 10_000n };

describe("math — the three formulas behind every intent", () => {
  it("[INV-1] debtForLeverage: 1x means no debt, C·L = C + D", () => {
    expect(debtForLeverage(1_000n, X1)).toBe(0n);
    expect(debtForLeverage(1_000n, X2)).toBe(1_000n);
    expect(debtForLeverage(1_000n, X3)).toBe(2_000n);
    // total value = collateral · leverage
    for (const c of [1n, 7n, 1_000n, 123_456_789n]) {
      expect(c + debtForLeverage(c, X3)).toBe((c * X3) / LEVERAGE_DECIMALS);
    }
  });

  it("[INV-2] proportionalDebt keeps D/C: dD/D0 = dC/C0", () => {
    // 2x: 1000 collateral, 1000 debt. Moving 100 of collateral moves 100 of debt.
    expect(proportionalDebt({ debt: 1_000n, collateral: 1_000n }, 100n)).toBe(
      100n,
    );
    // 3x: 1000 collateral, 2000 debt. 100 collateral ⇒ 200 debt.
    expect(proportionalDebt({ debt: 2_000n, collateral: 1_000n }, 100n)).toBe(
      200n,
    );
    // No debt ⇒ nothing to scale.
    expect(proportionalDebt({ debt: 0n, collateral: 1_000n }, 100n)).toBe(0n);
  });

  it("[INV-2] proportionalDebt on an account without collateral is unviable", () => {
    expect(() =>
      proportionalDebt({ debt: 1_000n, collateral: 0n }, 100n),
    ).toThrowError(
      expect.objectContaining({ reason: "insufficientSourceBalance" }),
    );
  });

  it("[INV-4] leverage below 1x is rejected as leverageOutOfRange", () => {
    expect(() => assertLeverageAtLeastOne(X1 - 1n)).toThrowError(
      expect.objectContaining({ reason: "leverageOutOfRange" }),
    );
    expect(() => assertLeverageAtLeastOne(X1)).not.toThrow();
  });

  it("[INV-9] debt must be zero or inside [minDebt, maxDebt]", () => {
    const inBand = (debt: bigint) => () => assertDebtInBand(debt, BAND, UND);
    expect(inBand(0n)).not.toThrow();
    expect(inBand(100n)).not.toThrow();
    expect(inBand(10_000n)).not.toThrow();
    expect(inBand(99n)).toThrowError(
      expect.objectContaining({ reason: "debtOutOfRange" }),
    );
    expect(inBand(10_001n)).toThrowError(
      expect.objectContaining({ reason: "debtOutOfRange" }),
    );
  });

  it("[INV-9] a debt outside the band reports the band it missed", () => {
    // The whole point of the detail: a slider that overshot gets the ceiling
    // to clamp to without a second call to find out what it is.
    expect(inBandDetail(10_001n)).toEqual({
      requested: { token: UND, balance: 10_001n },
      minDebt: { token: UND, balance: BAND.minDebt },
      maxDebt: { token: UND, balance: BAND.maxDebt },
    });
    // Under the floor the same three numbers say which end was missed.
    expect(inBandDetail(99n)).toEqual({
      requested: { token: UND, balance: 99n },
      minDebt: { token: UND, balance: BAND.minDebt },
      maxDebt: { token: UND, balance: BAND.maxDebt },
    });
  });

  it("[INV-10] maxProportionalWithdrawal: the largest W whose proportional repayment leaves debt ≥ minDebt", () => {
    // 2x: 1000 collateral, 1000 debt, minDebt 100 → at most 900 of debt can go,
    // and W < C0 always (the last unit closes rather than withdraws)
    const twoX = { debt: 1_000n, collateral: 1_000n };
    const w = maxProportionalWithdrawal(twoX, BAND);
    expect(twoX.debt - proportionalDebt(twoX, w)).toBeGreaterThanOrEqual(
      BAND.minDebt,
    );
    expect(twoX.debt - proportionalDebt(twoX, w + 1n)).toBeLessThan(
      BAND.minDebt,
    );
    expect(w).toBe(900n);

    // rounding: 100 debt on 1000 collateral, minDebt 50 → floor(100·W/1000) ≤ 50
    // holds up to W = 509
    const low = { debt: 100n, collateral: 1_000n };
    expect(
      maxProportionalWithdrawal(low, { minDebt: 50n, maxDebt: 10_000n }),
    ).toBe(509n);

    // the band allows more than the collateral holds: clamped to all but the
    // last unit (debt 1000 on 1000 collateral, minDebt 0)
    expect(
      maxProportionalWithdrawal(
        { debt: 1_000n, collateral: 1_000n },
        { minDebt: 0n, maxDebt: 10_000n },
      ),
    ).toBe(999n);
    // no debt: the band does not bind, everything but the last unit
    expect(
      maxProportionalWithdrawal({ debt: 0n, collateral: 1_000n }, BAND),
    ).toBe(999n);
    // already below minDebt: nothing can leave without breaking the band further
    expect(
      maxProportionalWithdrawal({ debt: 50n, collateral: 1_000n }, BAND),
    ).toBe(0n);
    // no collateral: nothing to withdraw
    expect(
      maxProportionalWithdrawal({ debt: 1_000n, collateral: 0n }, BAND),
    ).toBe(0n);
  });
});
