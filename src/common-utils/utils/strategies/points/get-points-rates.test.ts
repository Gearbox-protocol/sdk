import { describe, expect, it } from "vitest";
import { LEVERAGE_DECIMALS } from "../../../../sdk/constants/math.js";
import type { LocalPointsReward } from "../types.js";
import { getPointsRates } from "./get-points-rates.js";

const buildPointsReward = (
  multiplier: LocalPointsReward["multiplier"],
): LocalPointsReward => ({
  name: "reward",
  units: "pts",
  type: "test",
  multiplier,
});

describe("getPointsRates", () => {
  const leverage = 3n * LEVERAGE_DECIMALS; // factor 3x

  it("scales numeric multipliers by leverage", () => {
    const multiplier1 = 2n * LEVERAGE_DECIMALS;
    const multiplier2 = 1n * LEVERAGE_DECIMALS;
    const rewards: Array<LocalPointsReward> = [
      buildPointsReward(multiplier1),
      buildPointsReward(multiplier2),
    ];

    const result = getPointsRates(rewards, leverage);

    expect(result).toEqual([
      (leverage * multiplier1) / LEVERAGE_DECIMALS,
      (leverage * multiplier2) / LEVERAGE_DECIMALS,
    ]);
  });

  it('keeps multiplier as "soon" unchanged', () => {
    const multiplier = 1n * LEVERAGE_DECIMALS;
    const rewards: Array<LocalPointsReward> = [
      buildPointsReward("soon"),
      buildPointsReward(multiplier),
    ];

    const result = getPointsRates(rewards, leverage);

    expect(result).toEqual([
      "soon",
      (leverage * multiplier) / LEVERAGE_DECIMALS,
    ]);
  });
});
