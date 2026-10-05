import { describe, expect, it, vi } from "vitest";
import { UND } from "../testing/tokens.js";
import { checkDebtLimits } from "./checkDebtLimits.js";

describe("checkDebtLimits", () => {
  const limits = { minDebt: 100n, maxDebt: 10_000n, underlying: UND };
  const at = (debt: bigint, allowZero: boolean) =>
    checkDebtLimits({ ...limits, debt, allowZero });

  it("accepts the debtLimits endpoints", () => {
    expect(at(100n, true)).toEqual([]);
    expect(at(10_000n, true)).toEqual([]);
  });

  it("refuses either side of debtLimits and reports all three numbers", () => {
    expect(at(10_001n, true)).toEqual([
      {
        code: "debtOutOfRange",
        message: expect.any(String),
        requested: { token: UND, value: 10_001n, valueUsd: null },
        minDebt: { token: UND, value: 100n, valueUsd: null },
        maxDebt: { token: UND, value: 10_000n, valueUsd: null },
      },
    ]);
    expect(at(99n, true)[0]?.code).toBe("debtOutOfRange");
  });

  it("carries the maxBorrowAmount the caller supplied, in the same underlying", () => {
    const [error] = checkDebtLimits({
      ...limits,
      debt: 10_001n,
      allowZero: true,
      maxBorrowAmount: {
        amount: { token: UND, value: 50n, valueUsd: null },
        limit: "poolAvailableLiquidity",
      },
    });

    expect(error?.maxBorrowAmount).toEqual({
      amount: { token: UND, value: 50n, valueUsd: null },
      limit: "poolAvailableLiquidity",
    });
  });

  it("leaves it out for a caller that raises to throw", () => {
    expect(at(10_001n, true)[0]?.maxBorrowAmount).toBeUndefined();
  });

  it("exempts a zero debt only where the caller says so", () => {
    // An adjustment may end owing nothing; an opening may not.
    expect(at(0n, true)).toEqual([]);
    expect(at(0n, false)[0]?.code).toBe("debtOutOfRange");
  });
});

it("builds collateral bounds lazily into the refusal", () => {
  const bounds = {
    min: { token: UND, value: 334n, valueUsd: null },
    max: { token: UND, value: 336n, valueUsd: null },
  };
  const getCollateralLimits = vi.fn(() => bounds);
  const args = {
    minDebt: 100n,
    maxDebt: 200n,
    allowZero: false,
    underlying: UND,
    getCollateralLimits,
  };
  checkDebtLimits({ ...args, debt: 100n });
  expect(getCollateralLimits).not.toHaveBeenCalled();
  const [error] = checkDebtLimits({ ...args, debt: 99n });
  expect(getCollateralLimits).toHaveBeenCalledTimes(1);
  expect(error?.collateralLimits).toBe(bounds);
});
