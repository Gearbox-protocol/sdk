import { describe, expect, it } from "vitest";
import { PERCENTAGE_FACTOR, WAD } from "../../../sdk/constants/math.js";
import { toBN } from "../../../sdk/utils/formatter.js";
import { getCollateralByDebt } from "./get-collateral-by-debt.js";

describe("getCollateralByDebt", () => {
  it("returns full debt when target HF equals 1 and LT is 0.5", () => {
    const debt = 1_000_000n;
    const lt = toBN("0.5", 4);

    const result = getCollateralByDebt(debt, lt);

    expect(result).toBe(debt);
  });
  it("returns 0 when lt = hf", () => {
    const debt = 1_000_000n;

    const result = getCollateralByDebt(debt, PERCENTAGE_FACTOR);

    expect(result).toBe(0n);
  });
  it("returns when lt = 0", () => {
    const debt = 1_000_000n;

    const result = getCollateralByDebt(debt, 0n);

    expect(result).toBe(0n);
  });

  it("handles fractional LT and target HF values", () => {
    const debt = (35n * WAD) / 2n; // 17.5 in WAD
    const lt = toBN("0.93", 4); // 0.93
    const targetHF = toBN("1.035", 4);

    const result = getCollateralByDebt(debt, lt, targetHF);

    expect(result).toBe(1_975_806_451_612_903_225n);
  });
});
