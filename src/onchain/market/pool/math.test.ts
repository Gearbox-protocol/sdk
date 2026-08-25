import { describe, expect, it } from "vitest";
import {
  borrowRateAtUtilization,
  type RateModelParams,
  rateCurveUtilizations,
  supplyRateAtUtilization,
  utilizationAfterLiquidityChange,
} from "./math.js";

/**
 * Kinks deliberately off the sampling grid, so the curve tests prove the kinks
 * are added rather than happening to coincide with a sample.
 **/
const model: RateModelParams = {
  U1: 7050,
  U2: 9250,
  Rbase: 0,
  Rslope1: 200,
  Rslope2: 300,
  Rslope3: 4000,
  isBorrowingMoreU2Forbidden: false,
};

describe("borrowRateAtUtilization", () => {
  it("starts at the base rate", () => {
    expect(borrowRateAtUtilization(0, model)).toBe(0);
  });

  it("reaches each slope's full contribution at its kink", () => {
    expect(borrowRateAtUtilization(model.U1, model)).toBe(200);
    expect(borrowRateAtUtilization(model.U2, model)).toBe(500);
    expect(borrowRateAtUtilization(10_000, model)).toBe(4500);
  });

  it("interpolates inside a segment", () => {
    expect(borrowRateAtUtilization(model.U1 / 2, model)).toBe(100);
    expect(borrowRateAtUtilization(9625, model)).toBe(2500);
  });

  it("clamps utilizations outside the model's range", () => {
    expect(borrowRateAtUtilization(-100, model)).toBe(0);
    expect(borrowRateAtUtilization(20_000, model)).toBe(4500);
  });
});

describe("supplyRateAtUtilization", () => {
  it("spreads the borrowers' interest over the whole pool", () => {
    expect(supplyRateAtUtilization(model.U2, model)).toBe(
      Math.round((500 * model.U2) / 10_000),
    );
  });

  it("pays nothing when nothing is borrowed", () => {
    expect(supplyRateAtUtilization(0, model)).toBe(0);
  });
});

describe("rateCurveUtilizations", () => {
  const points = rateCurveUtilizations(model);

  it("covers the whole range in ascending order", () => {
    expect(points[0]).toBe(0);
    expect(points.at(-1)).toBe(10_000);
    expect(points).toStrictEqual([...points].sort((a, b) => a - b));
  });

  it("includes both kinks, so the borrow leg is exact rather than sampled", () => {
    expect(points).toContain(model.U1);
    expect(points).toContain(model.U2);
  });

  it("does not repeat a kink that falls on the grid", () => {
    const onGrid = rateCurveUtilizations({ ...model, U1: 500, U2: 9000 });
    expect(new Set(onGrid).size).toBe(onGrid.length);
  });
});

describe("utilizationAfterLiquidityChange", () => {
  // 1000 expected, 400 available: 600 borrowed = 60%
  const expectedLiquidity = 1000n;
  const availableLiquidity = 400n;

  it("reports the current utilization when nothing moves", () => {
    expect(
      utilizationAfterLiquidityChange(
        expectedLiquidity,
        availableLiquidity,
        0n,
      ),
    ).toBe(6000);
  });

  it("rises when an operation borrows liquidity out of the pool", () => {
    expect(
      utilizationAfterLiquidityChange(
        expectedLiquidity,
        availableLiquidity,
        -200n,
      ),
    ).toBe(8000);
  });

  it("falls when an operation repays liquidity back into the pool", () => {
    expect(
      utilizationAfterLiquidityChange(
        expectedLiquidity,
        availableLiquidity,
        200n,
      ),
    ).toBe(4000);
  });

  it("clamps a borrow that would drain the pool to full utilization", () => {
    expect(
      utilizationAfterLiquidityChange(
        expectedLiquidity,
        availableLiquidity,
        -900n,
      ),
    ).toBe(10_000);
  });

  it("floors a repayment larger than the debt at zero", () => {
    expect(
      utilizationAfterLiquidityChange(
        expectedLiquidity,
        availableLiquidity,
        900n,
      ),
    ).toBe(0);
  });

  it("reports zero for a pool with no liquidity at all", () => {
    expect(utilizationAfterLiquidityChange(0n, 0n, -100n)).toBe(0);
  });
});
