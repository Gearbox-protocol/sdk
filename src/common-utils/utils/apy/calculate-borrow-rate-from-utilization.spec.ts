import { describe, expect, it } from "vitest";
import type { LinearModel } from "../strategies/types/strategy-data.js";
import { calculateBorrowRateFromUtilization } from "./calculate-borrow-rate-from-utilization.js";

describe("calculateBorrowRateFromUtilization", () => {
  const model: LinearModel = {
    U_1: 30n,
    U_2: 80n,
    R_base: 100n,
    R_slope1: 200n,
    R_slope2: 300n,
    R_slope3: 400n,
    interestModel: "0x1",
    isBorrowingMoreU2Forbidden: false,
    version: 3,
  };

  it("returns base rate when util is zero", () => {
    expect(calculateBorrowRateFromUtilization(0n, model)).toBe(100n);
  });

  it("uses first segment when util <= U1", () => {
    // rate = R_base + R_slope1 * util / U1 = 100 + 200*15/30 = 200
    expect(calculateBorrowRateFromUtilization(15n, model)).toBe(200n);
  });

  it("uses second segment when U1 < util <= U2", () => {
    // rate = R_base + R_slope1 + R_slope2 * (util-U1)/(U2-U1)
    // util=50 → 100 + 200 + 300*(20/50)= 100+200+120=420
    expect(calculateBorrowRateFromUtilization(50n, model)).toBe(420n);
  });

  it("uses third segment when util > U2", () => {
    // rate = R_base + R_slope1 + R_slope2 + R_slope3*(util-U2)/(1-U2)
    // util=90, (util-U2)=10, (1-U2)=1-80= -? note util values are bigint as percents
    // Here ONE=PERCENTAGE_FACTOR=10000n; model values treated as percents -> extraPrecision default 1
    // (util-U2)/(ONE-U2) = 10/(10000-80)=10/9920=0 (integer)
    // rate => 100+200+300 = 600
    expect(calculateBorrowRateFromUtilization(90n, model)).toBe(600n);
  });

  it("supports extraPrecision scaling", () => {
    // With extraPrecision=100n, util=3000 (30%), U1=3000, U2=8000
    const scaled = calculateBorrowRateFromUtilization(3000n, model, 100n);
    // util == U1 so rate = R_base + R_slope1 * util/U1 = 10000 + 20000 = 30000
    expect(scaled).toBe(30000n);
  });
});
