import type { Address } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PERCENTAGE_FACTOR, toBigInt } from "../../../../sdk/index.js";
import { buildCreditManager, mockToken1 } from "../../../test-utils/index.js";
import { calculateEffectiveBorrowRate } from "../../apy/calculate-effective-borrow-rate.js";
import { getComplexAPYList } from "../../apy/get-complex-apy-list.js";
import { getSingleQuotaBorrowRate } from "../../apy/get-single-quota-borrow-rate.js";
import { maxAPYFormula } from "../../apy/max-apy-formula.js";
import type { LeverageFactor } from "../leverage/get-factor-from-leverage.js";
import { calculateMaxLeverageFactor } from "../leverage/index.js";
import { getStrategyMaxAPY } from "./get-strategy-max-apy.js";

// Mock dependencies
vi.mock(
  "../../apy/calculate-effective-borrow-rate.js",
  async importOriginal => {
    const actual = await importOriginal<Record<string, unknown>>();
    return { ...actual, calculateEffectiveBorrowRate: vi.fn() };
  },
);
vi.mock("../../apy/get-complex-apy-list.js", async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, getComplexAPYList: vi.fn() };
});
vi.mock("../../apy/get-single-quota-borrow-rate.js", async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, getSingleQuotaBorrowRate: vi.fn() };
});
vi.mock("../../apy/max-apy-formula.js", async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, maxAPYFormula: vi.fn() };
});
vi.mock(
  "../leverage/calculate-max-leverage-factor.js",
  async importOriginal => {
    const actual = await importOriginal<Record<string, unknown>>();
    return { ...actual, calculateMaxLeverageFactor: vi.fn() };
  },
);

const mockCalculateEffectiveBorrowRate = vi.mocked(
  calculateEffectiveBorrowRate,
);
const mockCalculateMaxLeverageFactor = vi.mocked(calculateMaxLeverageFactor);
const mockGetComplexAPYList = vi.mocked(getComplexAPYList);
const mockGetSingleQuotaBorrowRate = vi.mocked(getSingleQuotaBorrowRate);
const mockMaxAPYFormula = vi.mocked(maxAPYFormula);

const mockCreditManager = buildCreditManager({
  chainId: 1,
  pool: "0xcccccccccccccccccccccccccccccccccccccccc",
  underlyingToken: "0x9999999999999999999999999999999999999999",
  baseBorrowRate: 10,
  feeInterest: 100,
  liquidationThresholds: {
    [mockToken1]: 8000n,
  },
  quotas: {
    [mockToken1]: {
      token: mockToken1,
      rate: 500n,
      quotaIncreaseFee: 0n,
      totalQuoted: 0n,
      limit: 0n,
      isActive: true,
    },
  },
});

describe("getStrategyMaxAPY", () => {
  const mockAPYListByNetwork = {
    1: {
      apyList: {
        [mockToken1]: 100,
      },
      extraCollateralAPYList: undefined,
    },
  };

  beforeEach(() => {
    mockGetComplexAPYList.mockReturnValue({
      [mockToken1]: 100,
    });
    mockCalculateEffectiveBorrowRate.mockReturnValue(30);
    mockGetSingleQuotaBorrowRate.mockReturnValue(50n);
    mockMaxAPYFormula.mockReturnValue(150);
    mockCalculateMaxLeverageFactor.mockReturnValue(
      120n as unknown as LeverageFactor,
    );
  });

  it("should return undefined when credit manager is undefined", () => {
    const result = getStrategyMaxAPY(
      mockToken1,
      undefined,
      mockAPYListByNetwork,
      100,
      5,
      10,
    );

    expect(result).toBeUndefined();
  });

  it("should calculate strategy max APY with all components", () => {
    const quotaReserve = 100;
    mockCalculateMaxLeverageFactor.mockReturnValue(
      120n as unknown as LeverageFactor,
    );

    const result = getStrategyMaxAPY(
      mockToken1,
      mockCreditManager,
      mockAPYListByNetwork,
      100,
      quotaReserve,
      10,
    );

    expect(mockGetComplexAPYList).toHaveBeenCalledWith(
      mockAPYListByNetwork[1]?.apyList,
      mockAPYListByNetwork[1]?.extraCollateralAPYList,
      mockCreditManager.pool,
    );
    expect(mockCalculateEffectiveBorrowRate).toHaveBeenCalledWith({
      underlyingTokenAddress: mockCreditManager.underlyingToken,
      baseRateWithFee: mockCreditManager.baseBorrowRate,
      apyList: mockAPYListByNetwork[1]?.apyList,
    });
    expect(mockGetSingleQuotaBorrowRate).toHaveBeenCalledWith({
      quotaRates: {
        [mockToken1]: {
          ...mockCreditManager.quotas[mockToken1],
          rate:
            (((500n * mockCreditManager.liquidationThresholds[mockToken1]) /
              PERCENTAGE_FACTOR) *
              (PERCENTAGE_FACTOR + toBigInt(quotaReserve))) /
            PERCENTAGE_FACTOR,
        },
      },
      feeInterest: mockCreditManager.feeInterest,
      quotas: { [mockToken1]: { token: mockToken1, balance: 1n } },
    });
    expect(mockMaxAPYFormula).toHaveBeenCalledWith({
      apy: 100,
      leverage: 220n,
      baseRateWithFee: 30,
      quotaRateWithFee: 50,
    });
    expect(mockCalculateMaxLeverageFactor).toHaveBeenCalledWith({
      targetToken: mockToken1,
      creditManagers: [mockCreditManager],
      slippage: 100,
      leverageLimit: 10,
    });

    expect(result).toEqual({
      totalMaxApy: 150,
      bonusAPY: undefined,
      maxAPY: 150,
      maxLeverage: 220n,
      effectiveQuotaRate: 50n,
      effectiveBaseRate: 30,
      totalBorrowRate: 80,
    });
  });

  it("should include bonus APY when available", () => {
    const result = getStrategyMaxAPY(
      "0x8AcA0841993ef4C87244d519166e767f49362C21".toLowerCase() as Address,
      mockCreditManager,
      mockAPYListByNetwork,
      100,
      5,
      10,
    );

    expect(result).toEqual({
      totalMaxApy: 150,
      bonusAPY: undefined,
      maxAPY: 150,
      maxLeverage: 220n,
      effectiveQuotaRate: 50n,
      effectiveBaseRate: 30,
      totalBorrowRate: 80,
    });
  });
});
