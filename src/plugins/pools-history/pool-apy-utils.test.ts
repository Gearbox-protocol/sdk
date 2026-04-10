import type { Address } from "abitype";
import { describe, expect, it } from "vitest";
import type { ExternalApy, PoolExtraApy } from "../../rewards/index.js";
import { PERCENTAGE_FACTOR } from "../../sdk/index.js";
import type { PoolFullAPY } from "./pool-apy-types.js";
import {
  calculatePoolFullAPY,
  calculatePoolFullAPY7DAgo,
} from "./pool-apy-utils.js";

describe("PoolUtils", () => {
  describe("calculatePoolFullAPY", () => {
    const depositAPY = 4; // percent-ish integer

    it("returns base only when no underlying/extra/external", () => {
      const result = calculatePoolFullAPY({
        depositAPY,
        underlyingAPY: 0,
        extraAPY: undefined,
        currentExternalList: undefined,
      });

      expect(result).toEqual({
        totalAPY: depositAPY,
        baseAPY: [{ type: "supplyAPY", apy: depositAPY }],
        extraAPY: [],
        extraAPYTotal: 0,
        externalAPY: undefined,
      });
    });

    it("includes tokenYield when underlyingAPY is positive", () => {
      const result = calculatePoolFullAPY({
        depositAPY,
        underlyingAPY: Number(PERCENTAGE_FACTOR / 2n), // 0.5
        extraAPY: [],
        currentExternalList: [],
      });

      expect(result).toEqual({
        totalAPY: depositAPY + 0.5,
        baseAPY: [
          { type: "supplyAPY", apy: depositAPY },
          { type: "tokenYield", apy: 0.5 },
        ],
        extraAPY: [],
        extraAPYTotal: 0,
        externalAPY: undefined,
      });
    });

    it("sums extra APY only when underlyingPrice defined", () => {
      const extraAPY: PoolExtraApy[] = [
        {
          token: "0x1",
          lastUpdated: "0",
          rewardToken: "0x2",
          rewardTokenSymbol: "R2",
          apy: 2,
        },
        {
          token: "0x3",
          lastUpdated: "0",
          rewardToken: "0x2",
          rewardTokenSymbol: "R2",
          apy: 2,
        },
        {
          token: "0x3",
          lastUpdated: "0",
          rewardToken: "0x2",
          rewardTokenSymbol: "R2",
          apy: -2,
        }, // filtered out
      ];

      const withPrice = calculatePoolFullAPY({
        depositAPY,
        underlyingAPY: 0,
        extraAPY,
        currentExternalList: [],
      });
      expect(withPrice).toEqual({
        totalAPY: depositAPY + 4,
        baseAPY: [{ type: "supplyAPY", apy: depositAPY }],
        extraAPY: extraAPY.slice(0, 2),
        extraAPYTotal: 4,
        externalAPY: undefined,
      });
    });

    it("builds externalAPY from first entry in current external list", () => {
      const poolAddressWithExternal: Address =
        "0x4d56c9cba373ad39df69eb18f076b7348000ae09";
      const currentExternalList: ExternalApy[] = [
        { name: "Royco", value: 3, pool: poolAddressWithExternal },
      ];
      const extraAPY: PoolExtraApy[] = [
        {
          token: "0x1",
          rewardToken: "0x2",
          rewardTokenSymbol: "R2",
          apy: 2,
          lastUpdated: "0",
        },
      ];

      const result = calculatePoolFullAPY({
        depositAPY,
        underlyingAPY: 0,
        extraAPY,
        currentExternalList,
      });

      expect(result).toEqual({
        totalAPY: depositAPY + 2,
        baseAPY: [{ type: "supplyAPY", apy: depositAPY }],
        extraAPY,
        extraAPYTotal: 2,
        externalAPY: {
          name: "Royco",
          value: 3,
          pool: "0x4d56c9cba373ad39df69eb18f076b7348000ae09",
          totalValue: depositAPY + 2 + 3,
        },
      });
    });

    it("uses first external entry when list is non-empty", () => {
      const poolAddress: Address = "0xpool";
      const currentExternalList: ExternalApy[] = [
        { name: "other", value: 5, pool: poolAddress },
      ];
      const result = calculatePoolFullAPY({
        depositAPY,
        underlyingAPY: 0,
        extraAPY: [],
        currentExternalList,
      });

      expect(result).toEqual({
        totalAPY: depositAPY,
        baseAPY: [{ type: "supplyAPY", apy: depositAPY }],
        extraAPY: [],
        extraAPYTotal: 0,
        externalAPY: {
          name: "other",
          value: 5,
          pool: poolAddress,
          totalValue: depositAPY + 5,
        },
      });
    });
  });

  describe("calculatePoolFullAPY7DAgo", () => {
    const poolAddress: Address = "0xpool7d";
    const depositAPY = 4;

    const poolAPYBase: PoolFullAPY = {
      totalAPY: 6.5,
      baseAPY: [
        { type: "supplyAPY", apy: 99 },
        { type: "tokenYield", apy: 0.25 },
      ],
      extraAPY: [],
      extraAPYTotal: 1.25,
      externalAPY: {
        name: "ext",
        value: 1,
        pool: poolAddress,
        totalValue: 5.25,
      },
    };

    it("sets loading7DAgo when pool7DAgo is missing and uses current depositAPY for supply row", () => {
      const result = calculatePoolFullAPY7DAgo({
        depositAPY,
        supplyAPY7DAgo: undefined,
        poolAPY: poolAPYBase,
      });

      const baseTotal = depositAPY + 0.25;

      expect(result).toEqual({
        totalAPY: baseTotal + poolAPYBase.extraAPYTotal,
        extraAPYTotal: poolAPYBase.extraAPYTotal,
        baseAPY: [
          { type: "supplyAPY", apy: depositAPY },
          { type: "tokenYield", apy: 0.25 },
        ],
        extraAPY: poolAPYBase.extraAPY,
        externalAPY: poolAPYBase.externalAPY,
        loading7DAgo: true,
      });
    });

    it("uses supplyAPY7DAgo when pool7DAgo is loaded and drops prior supplyAPY from poolAPY", () => {
      const result = calculatePoolFullAPY7DAgo({
        depositAPY,
        supplyAPY7DAgo: 2.5,
        poolAPY: poolAPYBase,
      });

      const baseTotal = 2.5 + 0.25;

      expect(result.loading7DAgo).toBe(false);
      expect(result.baseAPY[0]).toEqual({
        type: "supplyAPY",
        apy: 2.5,
      });
      expect(result.totalAPY).toBe(baseTotal + poolAPYBase.extraAPYTotal);
    });

    it("falls back to depositAPY when 7d snapshot is loaded but supplyAPY7DAgo is absent", () => {
      const result = calculatePoolFullAPY7DAgo({
        depositAPY: 8,
        supplyAPY7DAgo: null,
        poolAPY: poolAPYBase,
      });

      expect(result.loading7DAgo).toBe(false);
      expect(result.baseAPY[0]).toEqual({ type: "supplyAPY", apy: 8 });
    });

    it("treats missing poolAPY as empty extras", () => {
      const result = calculatePoolFullAPY7DAgo({
        depositAPY: 3,
        supplyAPY7DAgo: undefined,
        poolAPY: undefined,
      });

      expect(result).toEqual({
        totalAPY: 3,
        extraAPYTotal: 0,
        baseAPY: [{ type: "supplyAPY", apy: 3 }],
        extraAPY: [],
        externalAPY: undefined,
        loading7DAgo: true,
      });
    });
  });
});
