import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type {
  BasePointsList,
  ExtraCollateralPointsList,
  LocalPointsReward,
} from "../types.js";
import { getComplexPointsList } from "./get-complex-points-list.js";

describe("getComplexPointsList", () => {
  const poolA: Address = "0xpoola";
  const poolB: Address = "0xpoolb";
  const tokenX: Address = "0xtokenx";
  const tokenY: Address = "0xtokeny";

  const basePoints = {
    [tokenX]: {
      symbol: "TKX",
      address: tokenX,
      rewards: [] as LocalPointsReward[],
    },
    [tokenY]: {
      symbol: "TKY",
      address: tokenY,
      rewards: [] as LocalPointsReward[],
    },
  } as unknown as BasePointsList;

  const extraPoints = {
    [poolA]: {
      [tokenX]: {
        symbol: "TKX-extra",
        address: tokenX,
        rewards: [{ name: "A", units: "pts", multiplier: 1n, type: "test" }],
      },
    },
  } as unknown as ExtraCollateralPointsList;

  it("returns base list when pool is undefined", () => {
    const res = getComplexPointsList(basePoints, extraPoints, undefined);
    expect(res).toEqual(basePoints);
  });

  it("returns base list when there is no extra for pool", () => {
    const res = getComplexPointsList(basePoints, extraPoints, poolB);
    expect(res).toEqual(basePoints);
  });

  it("overrides only tokens present in pool extras and keeps others intact", () => {
    const res = getComplexPointsList(basePoints, extraPoints, poolA);
    expect(res?.[tokenX]).toEqual(extraPoints[poolA][tokenX]);
    expect(res?.[tokenY]).toEqual(basePoints[tokenY]);
  });

  it("adds tokens that exist only in extras when base is empty object", () => {
    const emptyBase = {} as BasePointsList;
    const res = getComplexPointsList(emptyBase, extraPoints, poolA);
    expect(res).toEqual({
      [tokenX]: extraPoints[poolA][tokenX],
    });
  });

  it("adds tokens that exist only in extras when base is undefined", () => {
    const res = getComplexPointsList(undefined, extraPoints, poolA);
    expect(res).toEqual({
      [tokenX]: extraPoints[poolA][tokenX],
    });
  });

  it("preserves original base APY list (does not mutate)", () => {
    const originalBasePoints = { ...basePoints };
    getComplexPointsList(basePoints, extraPoints, poolA);
    expect(basePoints).toEqual(originalBasePoints);
  });
});
