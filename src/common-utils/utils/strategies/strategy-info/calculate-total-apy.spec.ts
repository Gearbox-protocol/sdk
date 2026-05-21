import type { Address } from "viem";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PERCENTAGE_FACTOR } from "../../../../sdk/constants/math.js";
import {
  mockPrices,
  mockToken1,
  mockTokenData,
  mockUnderlyingToken,
} from "../../../test-utils/index.js";
import { calcOverallAPY } from "../../creditAccount/calc-overall-apy.js";
import { calculateTotalAPY } from "./calculate-total-apy.js";

vi.mock("../../utils/creditAccount/calc-overall-apy.js", async () => {
  const actual = await vi.importActual(
    "../../utils/creditAccount/calc-overall-apy.js",
  );

  return {
    ...(actual as object),
    calcOverallAPY: vi.fn(
      (actual as { calcOverallAPY: typeof calcOverallAPY }).calcOverallAPY,
    ),
  };
});

const buildLpAPYList = (
  entries: Array<{ token: `0x${string}`; apy: number }>,
): Record<Address, number> =>
  entries.reduce(
    (acc, { token, apy }) => {
      acc[token] = apy;
      return acc;
    },
    {} as Record<Address, number>,
  );

describe("calculateTotalAPY", () => {
  const baseArgs = {
    caAssets: [{ token: mockToken1, balance: 1n }],
    lpAPY: buildLpAPYList([{ token: mockToken1, apy: 1 }]),
    pointsInfo: { address: mockToken1 },
    isValueTo: false,
    debt: 1n,
    totalValue: 1n,
    effectiveBorrowRate: 1,
    showAPY: true,
    prices: mockPrices,
    quotaRates: {},
    quotas: {},
    feeInterest: 0,
    underlyingToken: mockUnderlyingToken,
    tokensList: mockTokenData,
  };

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("returns pointsNoAPY undefined for valueFrom when points have no APY", () => {
    const result = calculateTotalAPY({
      ...baseArgs,
      lpAPY: buildLpAPYList([]),
    });

    expect(result).toEqual({
      overallAPY: undefined,
      overallAPYBigInt: undefined,
      overallAPYStatus: "pointsNoAPY",
    });
  });

  it("returns pointsNoAPY null for valueTo when points have no APY", () => {
    const result = calculateTotalAPY({
      ...baseArgs,
      lpAPY: buildLpAPYList([]),
      isValueTo: true,
    });

    expect(result).toEqual({
      overallAPY: null,
      overallAPYBigInt: null,
      overallAPYStatus: "pointsNoAPY",
    });
  });

  it("returns noAPY when pointsWithAPY but missing required values", () => {
    const result = calculateTotalAPY({
      ...baseArgs,
      debt: 0n,
    });

    expect(result).toEqual({
      overallAPY: undefined,
      overallAPYBigInt: undefined,
      overallAPYStatus: "noAPY",
    });
  });

  it("returns notEnoughFarmAssets when showAPY is false", () => {
    const result = calculateTotalAPY({
      ...baseArgs,
      showAPY: false,
    });

    expect(result).toEqual({
      overallAPY: null,
      overallAPYBigInt: null,
      overallAPYStatus: "notEnoughFarmAssets",
    });
  });

  it("returns noAPY when calcOverallAPY returns undefined", () => {
    vi.mocked(calcOverallAPY).mockReturnValue(undefined);

    const result = calculateTotalAPY(baseArgs);

    expect(calcOverallAPY).toHaveBeenCalledWith({
      caAssets: baseArgs.caAssets,
      lpAPY: baseArgs.lpAPY,
      prices: baseArgs.prices,

      quotaRates: baseArgs.quotaRates,
      quotas: baseArgs.quotas,
      feeInterest: baseArgs.feeInterest,

      totalValue: baseArgs.totalValue,
      debt: baseArgs.debt,
      baseRateWithFee: baseArgs.effectiveBorrowRate,
      underlyingToken: baseArgs.underlyingToken,
      tokensList: baseArgs.tokensList,
    });

    expect(result).toEqual({
      overallAPY: undefined,
      overallAPYBigInt: undefined,
      overallAPYStatus: "noAPY",
    });
  });

  it("returns negativeForPoints undefined when APY <= 0 and valueFrom", () => {
    vi.mocked(calcOverallAPY).mockReturnValue(0n);

    const result = calculateTotalAPY(baseArgs);

    expect(calcOverallAPY).toHaveBeenCalledWith({
      caAssets: baseArgs.caAssets,
      lpAPY: baseArgs.lpAPY,
      prices: baseArgs.prices,

      quotaRates: baseArgs.quotaRates,
      quotas: baseArgs.quotas,
      feeInterest: baseArgs.feeInterest,

      totalValue: baseArgs.totalValue,
      debt: baseArgs.debt,
      baseRateWithFee: baseArgs.effectiveBorrowRate,
      underlyingToken: baseArgs.underlyingToken,
      tokensList: baseArgs.tokensList,
    });

    expect(result).toEqual({
      overallAPY: undefined,
      overallAPYBigInt: undefined,
      overallAPYStatus: "negativeForPoints",
    });
  });

  it("returns negativeForPoints null when APY <= 0 and valueTo", () => {
    vi.mocked(calcOverallAPY).mockReturnValue(0n);

    const result = calculateTotalAPY({
      ...baseArgs,
      isValueTo: true,
    });

    expect(calcOverallAPY).toHaveBeenCalledWith({
      caAssets: baseArgs.caAssets,
      lpAPY: baseArgs.lpAPY,
      prices: baseArgs.prices,

      quotaRates: baseArgs.quotaRates,
      quotas: baseArgs.quotas,
      feeInterest: baseArgs.feeInterest,

      totalValue: baseArgs.totalValue,
      debt: baseArgs.debt,
      baseRateWithFee: baseArgs.effectiveBorrowRate,
      underlyingToken: baseArgs.underlyingToken,
      tokensList: baseArgs.tokensList,
    });

    expect(result).toEqual({
      overallAPY: null,
      overallAPYBigInt: null,
      overallAPYStatus: "negativeForPoints",
    });
  });

  it("returns calculated when APY is positive", () => {
    const apyBigInt = 2n * PERCENTAGE_FACTOR;
    vi.mocked(calcOverallAPY).mockReturnValue(apyBigInt);

    const result = calculateTotalAPY(baseArgs);

    expect(calcOverallAPY).toHaveBeenCalledWith({
      caAssets: baseArgs.caAssets,
      lpAPY: baseArgs.lpAPY,
      prices: baseArgs.prices,

      quotaRates: baseArgs.quotaRates,
      quotas: baseArgs.quotas,
      feeInterest: baseArgs.feeInterest,

      totalValue: baseArgs.totalValue,
      debt: baseArgs.debt,
      baseRateWithFee: baseArgs.effectiveBorrowRate,
      underlyingToken: baseArgs.underlyingToken,
      tokensList: baseArgs.tokensList,
    });

    expect(result).toEqual({
      overallAPYStatus: "calculated",
      overallAPY: 2,
      overallAPYBigInt: apyBigInt,
    });
  });
});
