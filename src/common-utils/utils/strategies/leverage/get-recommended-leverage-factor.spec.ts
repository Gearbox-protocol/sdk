import { describe, expect, it } from "vitest";
import type { LeverageFactor } from "./get-factor-from-leverage.js";
import { getRecommendedLeverageFactor } from "./get-recommended-leverage-factor.js";

describe("getRecommendedLeverageFactor", () => {
  it("returns zero when max factor is zero", () => {
    const factor = getRecommendedLeverageFactor({
      maxLeverageFactor: 0n as LeverageFactor,
    });

    expect(factor).toBe(0n);
  });

  it("returns 70% of max rounded down to tens", () => {
    const factor = getRecommendedLeverageFactor({
      maxLeverageFactor: 550n as LeverageFactor,
    });

    expect(factor).toBe(380n);
  });

  it("rounds down fractional 70% results to nearest ten", () => {
    const factor = getRecommendedLeverageFactor({
      maxLeverageFactor: 503n as LeverageFactor,
    });

    expect(factor).toBe(350n);
  });
});
