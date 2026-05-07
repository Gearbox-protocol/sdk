import { describe, expect, it } from "vitest";
import { LEVERAGE_DECIMALS } from "../../../sdk/index.js";
import { maxAPYFormula } from "./max-apy-formula.js";

describe("maxAPYFormula", () => {
  it("calculates apy with leverage and rates", () => {
    const apy = 100;
    const leverage = 3n * LEVERAGE_DECIMALS; // factor=300
    const baseRateWithFee = 10;
    const quotaRateWithFee = 5;

    const result = maxAPYFormula({
      apy,
      leverage,
      baseRateWithFee,
      quotaRateWithFee,
    });

    expect(result).toBe(265);
  });

  it("handles zero quotaRateWithFee", () => {
    const apy = 150;
    const leverage = 2n * LEVERAGE_DECIMALS; // factor=200
    const baseRateWithFee = 20;
    const quotaRateWithFee = 0;

    const result = maxAPYFormula({
      apy,
      leverage,
      baseRateWithFee,
      quotaRateWithFee,
    });

    expect(result).toBe(280);
  });

  it("floors negative debt term contribution", () => {
    const apy = 50;
    const leverage = 4n * LEVERAGE_DECIMALS; // factor=400
    const baseRateWithFee = 60;
    const quotaRateWithFee = 10;

    const result = maxAPYFormula({
      apy,
      leverage,
      baseRateWithFee,
      quotaRateWithFee,
    });

    expect(result).toBe(-20);
  });
});
