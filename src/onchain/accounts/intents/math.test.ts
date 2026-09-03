import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type { Token } from "../../../model/index.js";

import { LEVERAGE_DECIMALS } from "../../constants/math.js";
import { IntentPreviewError } from "../../validation/raise.js";
import {
  assertDebtLimits,
  assertLeverageAtLeastOne,
  debtForLeverage,
  maxProportionalWithdrawal,
  proportionalDebt,
} from "./math.js";

/** Stand-in underlying: debtLimits amounts are denominated in it. */
const UND = "0x0000000000000000000000000000000000000001" as Address;

/** What the registry hands back for it, which the refusal inlines. */
const UND_TOKEN: Token = {
  chainId: 1,
  address: UND,
  symbol: "UND",
  name: "Underlying",
  decimals: 18,
};

/** The debtLimits check inlines the token itself, so it is given a registry. */
const SDK = {
  chainId: 1,
  tokensMeta: { getToken: () => UND_TOKEN },
} as unknown as Parameters<typeof assertDebtLimits>[0];

/** The amount shape a refusal reports: the token inlined, no price attached. */
const und = (value: bigint) => ({ token: UND_TOKEN, value, valueUsd: null });

/** The error a debtLimits check raises, for a debt that draws one. */
function debtLimitsError(debt: bigint) {
  try {
    assertDebtLimits(SDK, debt, DEBT_LIMITS, UND);
  } catch (e) {
    if (e instanceof IntentPreviewError) return e.error;
  }
  throw new Error(`assertDebtLimits accepted ${debt}`);
}

const X1 = LEVERAGE_DECIMALS;
const X2 = 2n * LEVERAGE_DECIMALS;
const X3 = 3n * LEVERAGE_DECIMALS;

const DEBT_LIMITS = { minDebt: 100n, maxDebt: 10_000n };

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
      expect.objectContaining({ error: expect.objectContaining({ code: "insufficientBalance" }) }),
    );
  });

  it("[INV-4] leverage below 1x is rejected as leverageOutOfRange", () => {
    expect(() => assertLeverageAtLeastOne(X1 - 1n)).toThrowError(
      expect.objectContaining({ error: expect.objectContaining({ code: "leverageOutOfRange" }) }),
    );
    expect(() => assertLeverageAtLeastOne(X1)).not.toThrow();
  });

  it("[INV-9] debt must be zero or inside [minDebt, maxDebt]", () => {
    const withinLimits = (debt: bigint) => () =>
      assertDebtLimits(SDK, debt, DEBT_LIMITS, UND);
    expect(withinLimits(0n)).not.toThrow();
    expect(withinLimits(100n)).not.toThrow();
    expect(withinLimits(10_000n)).not.toThrow();
    expect(withinLimits(99n)).toThrowError(
      expect.objectContaining({ error: expect.objectContaining({ code: "debtOutOfRange" }) }),
    );
    expect(withinLimits(10_001n)).toThrowError(
      expect.objectContaining({ error: expect.objectContaining({ code: "debtOutOfRange" }) }),
    );
  });

  it("[INV-9] a debt outside debtLimits reports the limits it missed", () => {
    // The whole point of the detail: a slider that overshot gets the ceiling
    // to clamp to without a second call to find out what it is.
    expect(debtLimitsError(10_001n)).toMatchObject({
      code: "debtOutOfRange",
      requested: und(10_001n),
      minDebt: und(DEBT_LIMITS.minDebt),
      maxDebt: und(DEBT_LIMITS.maxDebt),
    });
    // Under the floor the same three numbers say which end was missed.
    expect(debtLimitsError(99n)).toMatchObject({
      code: "debtOutOfRange",
      requested: und(99n),
      minDebt: und(DEBT_LIMITS.minDebt),
      maxDebt: und(DEBT_LIMITS.maxDebt),
    });
  });

  it("[INV-10] maxProportionalWithdrawal: the largest W whose proportional repayment leaves debt ≥ minDebt", () => {
    // 2x: 1000 collateral, 1000 debt, minDebt 100 → at most 900 of debt can go,
    // and W < C0 always (the last unit closes rather than withdraws)
    const twoX = { debt: 1_000n, collateral: 1_000n };
    const w = maxProportionalWithdrawal(twoX, DEBT_LIMITS);
    expect(twoX.debt - proportionalDebt(twoX, w)).toBeGreaterThanOrEqual(
      DEBT_LIMITS.minDebt,
    );
    expect(twoX.debt - proportionalDebt(twoX, w + 1n)).toBeLessThan(
      DEBT_LIMITS.minDebt,
    );
    expect(w).toBe(900n);

    // rounding: 100 debt on 1000 collateral, minDebt 50 → floor(100·W/1000) ≤ 50
    // holds up to W = 509
    const low = { debt: 100n, collateral: 1_000n };
    expect(
      maxProportionalWithdrawal(low, { minDebt: 50n, maxDebt: 10_000n }),
    ).toBe(509n);

    // debtLimits allow more than the collateral holds: clamped to all but the
    // last unit (debt 1000 on 1000 collateral, minDebt 0)
    expect(
      maxProportionalWithdrawal(
        { debt: 1_000n, collateral: 1_000n },
        { minDebt: 0n, maxDebt: 10_000n },
      ),
    ).toBe(999n);
    // no debt: debtLimits do not bind, everything but the last unit
    expect(
      maxProportionalWithdrawal({ debt: 0n, collateral: 1_000n }, DEBT_LIMITS),
    ).toBe(999n);
    // already below minDebt: nothing can leave without breaking debtLimits further
    expect(
      maxProportionalWithdrawal({ debt: 50n, collateral: 1_000n }, DEBT_LIMITS),
    ).toBe(0n);
    // no collateral: nothing to withdraw
    expect(
      maxProportionalWithdrawal({ debt: 1_000n, collateral: 0n }, DEBT_LIMITS),
    ).toBe(0n);
  });

  it("refuses a negative debt, which the old debtLimits check let through", () => {
    // The previous rule was `debt > 0n && debt < minDebt`, so anything below
    // zero slipped past it. A withdrawal that over-repays can produce one.
    expect(() => assertDebtLimits(SDK, -1n, DEBT_LIMITS, UND)).toThrowError();
  });
});
