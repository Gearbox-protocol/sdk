import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type {
  ExternalApy,
  PoolExtraApy,
  PoolPointsInfo,
} from "../../rewards/index.js";
import { RAY } from "../../sdk/constants/index.js";
import type { TokensMeta } from "../../sdk/index.js";
import type { PoolFullAPY } from "./pool-apy-types.js";
import {
  calculatePoolFullAPY,
  calculatePoolFullAPY7DAgo,
  calculatePoolPoints,
  calculateSupplyApy7d,
  getPoolExtraAPY,
} from "./pool-apy-utils.js";

/** Expected outputs for fixed inputs in `calculateSupplyApy7d` tests (pre-verified). */
const EXPECTED_SUPPLY_APY7D_FROM_CURRENT_RATE = 300;
const EXPECTED_SUPPLY_APY7D_FROM_DIESEL_CHANGE = 5400;

/** Raw underlying APY from snapshot (`/ PERCENTAGE_FACTOR` → display APY). */
const UNDERLYING_APY_RAW_HALF_PF = 5000;
const TOKEN_YIELD_FROM_UNDERLYING = 0.5;

function mockTokensMeta(
  decimalsByToken: Partial<Record<string, number>>,
): TokensMeta {
  return {
    get(addr: string) {
      const d = decimalsByToken[addr.toLowerCase()];
      return d !== undefined ? { decimals: d } : {};
    },
  } as unknown as TokensMeta;
}

describe("pool-apy-utils", () => {
  describe("getPoolExtraAPY", () => {
    const extra = (token: Address, apy: number): PoolExtraApy => ({
      token,
      lastUpdated: "0",
      rewardToken: "0x2",
      rewardTokenSymbol: "R",
      apy,
    });

    it("returns empty array when poolExtraAPYList is undefined", () => {
      expect(getPoolExtraAPY(["0xpool"], undefined)).toEqual([]);
    });

    it("returns empty array when no lookup address matches", () => {
      const list: Record<Address, PoolExtraApy[]> = {
        ["0xother"]: [extra("0x1", 1)],
      };
      expect(getPoolExtraAPY(["0xpool"], list)).toEqual([]);
    });

    it("collects extras in lookup order and matches keys case-insensitively", () => {
      const pool: Address = "0xpool";
      const staked: Address = "0xstaked";
      const list: Record<Address, PoolExtraApy[]> = {
        [pool.toLowerCase() as Address]: [extra("0xa", 1)],
        [staked.toLowerCase() as Address]: [extra("0xb", 2)],
      };
      expect(getPoolExtraAPY(["0xPOOL", "0xSTAKED"], list)).toEqual([
        extra("0xa", 1),
        extra("0xb", 2),
      ]);
    });
  });

  describe("calculateSupplyApy7d", () => {
    it("uses current supply rate when 7d diesel rate is higher than current", () => {
      const currentDiesel = 100n;
      const diesel7d = 200n;
      const supplyRate = 3n * RAY;
      const result = calculateSupplyApy7d(currentDiesel, supplyRate, diesel7d);
      expect(result).toBe(EXPECTED_SUPPLY_APY7D_FROM_CURRENT_RATE);
    });

    it("annualizes from diesel rate change when 7d rate is not higher than current", () => {
      const currentDieselRate = 200n;
      const dieselRate7DAgo = 100n;
      const currentSupplyRate = 0n;
      expect(
        calculateSupplyApy7d(
          currentDieselRate,
          currentSupplyRate,
          dieselRate7DAgo,
        ),
      ).toBe(EXPECTED_SUPPLY_APY7D_FROM_DIESEL_CHANGE);
    });
  });

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
        underlyingAPY: UNDERLYING_APY_RAW_HALF_PF,
        extraAPY: [],
        currentExternalList: [],
      });

      expect(result).toEqual({
        totalAPY: depositAPY + TOKEN_YIELD_FROM_UNDERLYING,
        baseAPY: [
          { type: "supplyAPY", apy: depositAPY },
          { type: "tokenYield", apy: TOKEN_YIELD_FROM_UNDERLYING },
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

  describe("calculatePoolPoints", () => {
    const rewardToken: Address = "0xtoken";
    const poolAddr: Address = "0xpool";

    it("returns undefined when points is undefined", () => {
      expect(
        calculatePoolPoints({
          poolTokenSymbol: "SYM",
          points: undefined,
          tokensList: mockTokensMeta({}),
        }),
      ).toBeUndefined();
    });

    it("returns empty array when points list is empty", () => {
      expect(
        calculatePoolPoints({
          poolTokenSymbol: "SYM",
          points: [],
          tokensList: mockTokensMeta({}),
        }),
      ).toEqual([]);
    });

    it("formats tips with decimals, duration, and pool token symbol", () => {
      const info: PoolPointsInfo<string> = {
        pool: poolAddr,
        token: rewardToken,
        symbol: "P",
        amount: 0n,
        duration: "week",
        name: "Bonus",
        type: "test",
        estimation: "absolute",
        condition: "deposit",
      };
      const points = [{ key: "k1", points: 1_500_000n, info }];
      const tokensList = mockTokensMeta({ [rewardToken]: 6 });
      const result = calculatePoolPoints({
        poolTokenSymbol: "dUSDC Vault",
        points,
        tokensList,
      });
      const formattedAmount = "1.50";
      expect(result).toEqual([
        {
          reward: info,
          name: "Bonus",
          amount: formattedAmount,
          tokenTitle: "dUSDC Vault",
          fullTip: `${formattedAmount} Bonus per week per dUSDC Vault`,
        },
      ]);
    });

    it("uses default name Points and omits duration segments when missing", () => {
      const info = {
        pool: poolAddr,
        token: rewardToken,
        symbol: "P",
        amount: 0n,
        duration: undefined,
        name: undefined,
        type: "t",
        estimation: "relative" as const,
        condition: "holding" as const,
      } as unknown as PoolPointsInfo<string>;
      const points = [{ key: "k1", points: 10n ** 18n, info }];
      const result = calculatePoolPoints({
        poolTokenSymbol: undefined,
        points,
        tokensList: mockTokensMeta({}),
      });
      const formattedAmount = "1.00";
      expect(result?.[0]?.name).toBe("Points");
      expect(result?.[0]?.amount).toBe(formattedAmount);
      expect(result?.[0]?.tokenTitle).toBeUndefined();
      expect(result?.[0]?.fullTip).toBe(`${formattedAmount} Points`);
    });
  });
});
