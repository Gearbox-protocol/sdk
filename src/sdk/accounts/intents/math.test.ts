import { describe, expect, it } from "vitest";

import { LEVERAGE_DECIMALS } from "../../constants/math.js";
import {
  assertDebtInBand,
  assertLeverageAtLeastOne,
  debtForLeverage,
  proportionalDebt,
} from "./math.js";

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
    expect(() => assertDebtInBand(0n, BAND)).not.toThrow();
    expect(() => assertDebtInBand(100n, BAND)).not.toThrow();
    expect(() => assertDebtInBand(10_000n, BAND)).not.toThrow();
    expect(() => assertDebtInBand(99n, BAND)).toThrowError(
      expect.objectContaining({ reason: "debtOutOfRange" }),
    );
    expect(() => assertDebtInBand(10_001n, BAND)).toThrowError(
      expect.objectContaining({ reason: "debtOutOfRange" }),
    );
  });
});
