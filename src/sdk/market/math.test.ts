import { describe, expect, it } from "vitest";
import {
  additionalBorrowApyBps,
  borrowApyBps,
  maxLeverage,
  rayToBps,
  usdToNumber,
  utilizationBps,
} from "./math.js";

const RAY_5_PERCENT = 50_000_000_000_000_000_000_000_000n;

describe("unit conversions", () => {
  it("converts ray rates to basis points", () => {
    expect(rayToBps(RAY_5_PERCENT)).toBe(500);
    expect(rayToBps(0n)).toBe(0);
  });

  it("converts oracle USD to a float", () => {
    expect(usdToNumber(150_050_000_000n)).toBe(1500.5);
  });
});

describe("utilizationBps", () => {
  it("is the borrowed share of the total", () => {
    expect(utilizationBps(750n, 1000n)).toBe(7500);
  });

  it("is zero when there is nothing to borrow from", () => {
    expect(utilizationBps(750n, 0n)).toBe(0);
    expect(utilizationBps(0n, 1000n)).toBe(0);
  });

  it("never exceeds 100%, which accrued interest alone could push it past", () => {
    expect(utilizationBps(1100n, 1000n)).toBe(10_000);
  });
});

describe("borrowApyBps", () => {
  it("adds the credit manager's cut to the pool's base rate", () => {
    expect(borrowApyBps(RAY_5_PERCENT, 5000)).toBe(750);
  });

  it("is the bare base rate when the manager takes no fee", () => {
    expect(borrowApyBps(RAY_5_PERCENT, 0)).toBe(500);
  });
});

describe("maxLeverage", () => {
  it("is one over the equity share the threshold leaves", () => {
    expect(maxLeverage(9000)).toBe(10);
    expect(maxLeverage(8000)).toBe(5);
  });

  it("is unleveraged when the collateral counts for nothing", () => {
    expect(maxLeverage(0)).toBe(1);
  });
});

describe("additionalBorrowApyBps", () => {
  it("scales the quota rate to the debt the position carries", () => {
    expect(additionalBorrowApyBps(250, 5)).toBe(1000);
  });

  it("is zero without leverage, where no debt is quoted", () => {
    expect(additionalBorrowApyBps(250, 1)).toBe(0);
    expect(additionalBorrowApyBps(250, Number.POSITIVE_INFINITY)).toBe(0);
  });
});
