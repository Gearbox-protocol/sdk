import { describe, expect, it } from "vitest";
import { buildCreditManager, buildPool } from "../../test-utils/index.js";
import type { LinearModel } from "../strategies/types/strategy-data.js";
import { calculateSafeBorrowRate } from "./calculate-safe-borrow-rate.js";

describe("calculateSafeBorrowRate", () => {
  const baseModel: LinearModel = {
    U_1: 50n,
    U_2: 80n,
    R_base: 100n,
    R_slope1: 0n,
    R_slope2: 0n,
    R_slope3: 0n,
    interestModel: "0x1",
    isBorrowingMoreU2Forbidden: false,
    version: 3,
  };

  const poolBase = buildPool({
    expectedLiquidity: 1_000n,
    availableLiquidity: 1_000n, // util = 0
    interestModel: baseModel,
  });

  it("returns rate with no fee at zero utilization", () => {
    const creditManager = buildCreditManager({ feeInterest: 0 });

    const rate = calculateSafeBorrowRate({
      pool: poolBase,
      creditManager,
    });

    expect(rate).toBe(10000); // R_base * extraPrecision(100) => 10_000 -> *10000 /10000 /100 => 100
  });

  it("applies feeInterest scaling", () => {
    const creditManager = buildCreditManager({ feeInterest: 200 }); // +2%

    const rate = calculateSafeBorrowRate({
      pool: poolBase,
      creditManager,
    });

    expect(rate).toBe(10200); // 100 * (10000+200)/10000
  });
});
