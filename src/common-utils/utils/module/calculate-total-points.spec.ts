import { describe, expect, it } from "vitest";
import {
  LEVERAGE_DECIMALS,
  PRICE_DECIMALS,
} from "../../../sdk/constants/math.js";
import {
  mockCMAddress,
  mockPrices,
  mockToken1,
  mockTokenData,
  mockUnderlyingToken,
} from "../../../test-utils";
import { calculateTotalPoints } from "./calculate-total-points.js";

describe("calculateTotalPoints", () => {
  const pointsInfo = {
    symbol: "PTS",
    address: mockToken1,
    rewards: [
      {
        name: "points",
        units: "pts",
        multiplier: LEVERAGE_DECIMALS,
        type: "base" as const,
      },
    ],
    debtRewards: [
      {
        name: "debt",
        units: "pts",
        multiplier: LEVERAGE_DECIMALS,
        type: "debt" as const,
        cm: mockCMAddress,
      },
    ],
  };

  const baseArgs = {
    pointsAsset: { token: mockToken1, balance: 1n },
    cmAddress: mockCMAddress,
    info: pointsInfo,
    totalValue: 10n * PRICE_DECIMALS,
    assetValue: 1n,
    prices: mockPrices,
    tokensList: mockTokenData,
    underlyingToken: mockUnderlyingToken,
  };

  it("returns null when no pointsAsset or info", () => {
    expect(
      calculateTotalPoints({
        ...baseArgs,
        pointsAsset: undefined,
      }),
    ).toBeNull();

    expect(
      calculateTotalPoints({
        ...baseArgs,
        info: undefined,
      }),
    ).toBeNull();
  });

  it("returns null when no totalValue", () => {
    expect(
      calculateTotalPoints({
        ...baseArgs,
        totalValue: undefined,
      }),
    ).toBeNull();

    expect(
      calculateTotalPoints({
        ...baseArgs,
        totalValue: 0n,
      }),
    ).toBeNull();
  });

  it("returns null when no assetValue", () => {
    expect(
      calculateTotalPoints({
        ...baseArgs,
        assetValue: undefined,
      }),
    ).toBeNull();

    expect(
      calculateTotalPoints({
        ...baseArgs,
        assetValue: 0n,
      }),
    ).toBeNull();
  });

  it("returns null when below threshold", () => {
    const result = calculateTotalPoints({
      ...baseArgs,
      totalValue: 10n * PRICE_DECIMALS,
    });

    expect(result).toBeNull();
  });

  it("returns points data when above threshold with matching debt rewards", () => {
    const assetAmount = PRICE_DECIMALS; // 1 unit
    const totalValue = 4n * PRICE_DECIMALS;
    const assetValue = PRICE_DECIMALS;

    const result = calculateTotalPoints({
      pointsAsset: { token: mockToken1, balance: assetAmount },
      cmAddress: mockCMAddress,
      info: pointsInfo,
      totalValue,
      assetValue,
      prices: {
        ...mockPrices,
        [mockToken1]: 2n * PRICE_DECIMALS,
      },
      tokensList: mockTokenData,
      underlyingToken: mockUnderlyingToken,
    });

    expect(result?.info).toBe(pointsInfo);
    expect(result?.rates).toEqual([2n * LEVERAGE_DECIMALS]);
    expect(result?.debtRates.rewards).toHaveLength(1);
    expect(result?.debtRates.rates).toEqual([2n * LEVERAGE_DECIMALS]);
  });

  it("returns points data when above threshold with matching debt rewards when debt is lower than asset amount", () => {
    const assetAmount = PRICE_DECIMALS; // 1 unit
    const totalValue = 4n * PRICE_DECIMALS;
    const assetValue = PRICE_DECIMALS;

    const result = calculateTotalPoints({
      pointsAsset: { token: mockToken1, balance: assetAmount },
      cmAddress: mockCMAddress,
      info: pointsInfo,
      totalValue,
      assetValue,
      prices: {
        ...mockPrices,
        [mockToken1]: 4n * PRICE_DECIMALS,
      },
      tokensList: mockTokenData,
      underlyingToken: mockUnderlyingToken,
    });

    expect(result?.info).toBe(pointsInfo);
    expect(result?.rates).toEqual([4n * LEVERAGE_DECIMALS]);
    expect(result?.debtRates.rewards).toHaveLength(1);
    expect(result?.debtRates.rates).toEqual([3n * LEVERAGE_DECIMALS]);
  });
});
