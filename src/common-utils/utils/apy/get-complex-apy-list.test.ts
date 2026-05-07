import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import { getComplexAPYList } from "./get-complex-apy-list.js";

describe("getComplexAPYList", () => {
  const poolA: Address = "0xpoola";
  const poolB: Address = "0xpoolb";
  const tokenX: Address = "0xtokenx";
  const tokenY: Address = "0xtokeny";

  const baseAPYList: Record<Address, number> = {
    [tokenX]: 1000, // 10% APY
    [tokenY]: 2000, // 20% APY
  };

  const extraCollateralAPYList: Record<
    Address,
    Record<Address, { type: "relative" | "absolute"; value: number }>
  > = {
    [poolA]: {
      [tokenX]: { type: "relative", value: 500 },
      [tokenY]: { type: "absolute", value: 3000 },
    },
  };

  it("returns base list when pool is undefined", () => {
    const res = getComplexAPYList(
      baseAPYList,
      extraCollateralAPYList,
      undefined,
    );
    expect(res).toEqual(baseAPYList);
  });

  it("returns base list when there is no extra collateral APY for pool", () => {
    const res = getComplexAPYList(baseAPYList, extraCollateralAPYList, poolB);
    expect(res).toEqual(baseAPYList);
  });

  it("applies relative type extra APY (adds to base APY)", () => {
    const res = getComplexAPYList(baseAPYList, extraCollateralAPYList, poolA);
    // tokenX should have base APY + extra APY (1000 + 500 = 1500)
    expect(res?.[tokenX]).toBe(1500);
  });

  it("applies absolute type extra APY (replaces base APY)", () => {
    const res = getComplexAPYList(baseAPYList, extraCollateralAPYList, poolA);
    // tokenY should have absolute APY (3000), not base + extra
    expect(res?.[tokenY]).toBe(3000);
  });

  it("handles mixed relative and absolute types in same pool", () => {
    const res = getComplexAPYList(baseAPYList, extraCollateralAPYList, poolA);
    // tokenX: relative (1000 + 500 = 1500)
    expect(res?.[tokenX]).toBe(1500);
    // tokenY: absolute (3000)
    expect(res?.[tokenY]).toBe(3000);
  });

  it("returns absolute APY from extraCollateralAPYList when base APY list is undefined", () => {
    const res = getComplexAPYList(undefined, extraCollateralAPYList, poolA);
    expect(res).toEqual({
      [tokenY]: extraCollateralAPYList[poolA][tokenY].value,
    });
  });

  it("returns base list when extra collateral APY list is undefined", () => {
    const res = getComplexAPYList(baseAPYList, undefined, poolA);
    expect(res).toEqual(baseAPYList);
  });

  it("preserves original base APY list (does not mutate)", () => {
    const originalBaseAPY = { ...baseAPYList };
    getComplexAPYList(baseAPYList, extraCollateralAPYList, poolA);
    expect(baseAPYList).toEqual(originalBaseAPY);
  });
});
