import { describe, expect, it } from "vitest";
import type { TokenAmount } from "../../../model/index.js";
import { MIN_HEALTH_FACTOR_FACADE } from "../helpers/index.js";
import { checkReservePriceLimited } from "./checkReservePriceLimited.js";

describe("checkReservePriceLimited", () => {
  const WITHDRAWABLE = {
    token: { address: "0x1", symbol: "UND", decimals: 18 },
    value: 0n,
  } as unknown as TokenAmount;

  const at = (healthFactor: number, atMainPrices: number) =>
    checkReservePriceLimited({
      healthFactor,
      atMainPrices,
      healthFactorThreshold: MIN_HEALTH_FACTOR_FACADE,
      withdrawable: WITHDRAWABLE,
    });

  it("blames the reserve feed only when the main feed would have passed", () => {
    expect(at(9_500, MIN_HEALTH_FACTOR_FACADE)[0]).toMatchObject({
      code: "reservePriceLimited",
      healthFactor: 9_500,
      atMainPrices: MIN_HEALTH_FACTOR_FACADE,
      healthFactorThreshold: MIN_HEALTH_FACTOR_FACADE,
      withdrawable: WITHDRAWABLE,
    });
  });

  it("stays quiet where both feeds refuse: the position is simply too small", () => {
    expect(at(9_500, 9_900)).toEqual([]);
  });

  it("stays quiet where the safe factor clears the threshold", () => {
    // Nothing was refused, so there is nothing to attribute to a feed.
    expect(at(MIN_HEALTH_FACTOR_FACADE, 20_000)).toEqual([]);
  });

  it("takes a main factor exactly at the threshold as passing", () => {
    // The threshold is inclusive for `checkCollateralised`, so the boundary has
    // to read the same way here or the two disagree about who refused.
    expect(at(9_999, MIN_HEALTH_FACTOR_FACADE)).toHaveLength(1);
    expect(at(9_999, MIN_HEALTH_FACTOR_FACADE - 1)).toEqual([]);
  });
});
