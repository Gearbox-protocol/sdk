import { describe, expect, it } from "vitest";
import type { OptimalRepaidAmountProps } from "./math.js";
import {
  calcAdditionalBorrowApy,
  calcBorrowApy,
  calcMaxLeverage,
  calcPositionLeverage,
  calcUtilization,
  minSeizedAmount,
  optimalHFForPartialLiquidation,
  optimalRepaidAmount,
  rayToBps,
  usdToNumber,
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

describe("calcUtilization", () => {
  it("is the borrowed share of the total", () => {
    expect(calcUtilization(750n, 1000n)).toBe(7500);
  });

  it("is zero when there is nothing to borrow from", () => {
    expect(calcUtilization(750n, 0n)).toBe(0);
    expect(calcUtilization(0n, 1000n)).toBe(0);
  });

  it("never exceeds 100%, which accrued interest alone could push it past", () => {
    expect(calcUtilization(1100n, 1000n)).toBe(10_000);
  });
});

describe("calcBorrowApy", () => {
  it("adds the credit manager's cut to the pool's base rate", () => {
    expect(calcBorrowApy(RAY_5_PERCENT, 5000)).toBe(750);
  });

  it("is the bare base rate when the manager takes no fee", () => {
    expect(calcBorrowApy(RAY_5_PERCENT, 0)).toBe(500);
  });
});

describe("calcMaxLeverage", () => {
  it("is 95% over the equity share the threshold leaves", () => {
    expect(calcMaxLeverage(9000)).toBe(9.5);
    expect(calcMaxLeverage(8000)).toBe(4.75);
    expect(calcMaxLeverage(9500)).toBe(19);
  });

  it("is unleveraged when the collateral counts for nothing", () => {
    expect(calcMaxLeverage(0)).toBe(1);
  });

  it("is zero when the threshold would allow unbounded leverage", () => {
    expect(calcMaxLeverage(10_000)).toBe(0);
  });
});

describe("calcPositionLeverage", () => {
  it("is total value over remaining equity", () => {
    expect(calcPositionLeverage(1000n, 800n)).toBe(5);
  });

  it("is 1x when the position carries no debt", () => {
    expect(calcPositionLeverage(1000n, 0n)).toBe(1);
  });

  it("is zero when the position is underwater", () => {
    expect(calcPositionLeverage(800n, 1000n)).toBe(0);
  });
});

describe("calcAdditionalBorrowApy", () => {
  it("scales the quota rate to the whole quoted position", () => {
    expect(calcAdditionalBorrowApy(250, 0, 9.5)).toBe(2375);
  });

  it("includes the DAO fee on quota interest", () => {
    expect(calcAdditionalBorrowApy(250, 2500, 9.5)).toBe(2969);
  });

  it("is zero without a finite positive leverage", () => {
    expect(calcAdditionalBorrowApy(250, 0, 0)).toBe(0);
    expect(calcAdditionalBorrowApy(250, 0, Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("minSeizedAmount", () => {
  it("undoes the liquidation discount and keeps the safety buffer", () => {
    expect(minSeizedAmount(1_000_000n, 10_000)).toBe(999_000n);
    expect(minSeizedAmount(1_000_000n, 9700)).toBe(1_029_896n);
  });

  it("is the plain repaid amount when the discount is the buffer itself", () => {
    expect(minSeizedAmount(1_000_000n, 9990)).toBe(1_000_000n);
  });
});

describe("optimalRepaidAmount", () => {
  // Underwater account: 1e6 of debt against 990k of threshold-weighted value.
  const props: OptimalRepaidAmountProps = {
    totalDebt: 1_000_000n,
    twvUnderlying: 990_000n,
    minDebt: 100_000n,
    optimalHF: 10_100n,
    discount: 9500n,
    ltTokenOut: 8000n,
  };

  it("repays enough to lift the account to the target health factor", () => {
    expect(optimalRepaidAmount(props)).toBe(119_121n);
  });

  it("throws when seizing the token cannot improve the account", () => {
    expect(() =>
      optimalRepaidAmount({ ...props, discount: 9000n, ltTokenOut: 9500n }),
    ).toThrow("cannot compute optimal repaid amount");
  });

  it("repays nothing when the account is already healthy enough", () => {
    expect(optimalRepaidAmount({ ...props, twvUnderlying: 2_000_000n })).toBe(
      0n,
    );
  });

  it("repays nothing when the account carries less than the minimum debt", () => {
    expect(optimalRepaidAmount({ ...props, minDebt: 2_000_000n })).toBe(0n);
  });

  it("leaves the minimum debt in place, since repaying past it would revert", () => {
    // surplus over minDebt is 1000, well under the 119_121 the target asks for
    expect(optimalRepaidAmount({ ...props, minDebt: 999_000n })).toBe(999n);
  });
});

describe("optimalHFForPartialLiquidation", () => {
  it("targets just above 1, by the account's borrow cost", () => {
    expect(optimalHFForPartialLiquidation(0n)).toBe(10_000n);
    expect(optimalHFForPartialLiquidation(50n)).toBe(10_050n);
  });

  it("caps the premium at 1%, so expensive debt does not overshoot", () => {
    expect(optimalHFForPartialLiquidation(100n)).toBe(10_100n);
    expect(optimalHFForPartialLiquidation(5000n)).toBe(10_100n);
  });
});
