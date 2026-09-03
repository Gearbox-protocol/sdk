import { describe, expect, it } from "vitest";
import { checkDebtLimits } from "./checkDebtLimits.js";
import { UND } from "./testing/tokens.js";

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

  it("exempts a zero debt only where the caller says so", () => {
    // An adjustment may end owing nothing; an opening may not.
    expect(at(0n, true)).toEqual([]);
    expect(at(0n, false)[0]?.code).toBe("debtOutOfRange");
  });
});
