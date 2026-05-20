import type { Address } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  LEVERAGE_DECIMALS,
  PERCENTAGE_FACTOR,
} from "../../../sdk/constants/math.js";
import { buildCreditManager, mockToken1 } from "../../../test-utils";
import { calculateLossCoefficient } from "../../utils/strategies/leverage/calculate-loss-coefficient.js";

import type { LeverageFactor } from "../../utils/strategies/leverage/get-factor-from-leverage.js";
import { calculateMaxStrategyDebt } from "./calculate-max-strategy-debt.js";
import { maxLeverage } from "./max-leverage.js";

vi.mock("./max-leverage");
vi.mock(
  "../../utils/strategies/leverage/calculate-loss-coefficient.js",
  async () => {
    const actual = await vi.importActual(
      "../../utils/strategies/leverage/calculate-loss-coefficient.js",
    );
    return {
      ...(actual as object),
      calculateLossCoefficient: vi.fn(
        (
          actual as {
            calculateLossCoefficient: typeof calculateLossCoefficient;
          }
        ).calculateLossCoefficient,
      ),
    };
  },
);

const mockMaxLeverage = vi.mocked(maxLeverage);
const mockCalculateLossCoefficient = vi.mocked(calculateLossCoefficient);

describe("calculateMaxStrategyDebt", () => {
  const mockCreditManager = buildCreditManager({});

  beforeEach(() => {
    mockMaxLeverage.mockReturnValue(
      (10n * LEVERAGE_DECIMALS) as LeverageFactor,
    );
    vi.clearAllMocks();
  });

  it("should return effectiveMaxDebt when amount is zero without calling maxLeverage", () => {
    const result = calculateMaxStrategyDebt({
      targetToken: mockToken1,
      amount: 0n,
      creditManager: mockCreditManager,
      slippage: 100,
      constantLoss: 30n,
    });

    expect(mockMaxLeverage).not.toHaveBeenCalled();
    expect(result).toEqual(900000n);
  });

  it("should calculate max debt correctly with mocked maxLeverage", () => {
    const maxLeverageValue = (5n * LEVERAGE_DECIMALS) as LeverageFactor; // 5x leverage
    mockMaxLeverage.mockReturnValue(maxLeverageValue);

    const targetToken = mockToken1;
    const amount = 10000n;

    const slippage = 100; // 1%
    const constantLoss = 30n;

    const result = calculateMaxStrategyDebt({
      targetToken: mockToken1,
      amount,
      creditManager: mockCreditManager,
      slippage,
      constantLoss,
    });

    expect(mockMaxLeverage).toHaveBeenCalledWith(targetToken, [
      mockCreditManager,
    ]);
    expect(mockMaxLeverage).toHaveBeenCalledTimes(1);
    expect(result).toEqual(49350n);
  });

  it("should handle case where effectiveDebt exceeds effectiveMaxDebt", () => {
    const veryHighLeverage = (100n * LEVERAGE_DECIMALS) as LeverageFactor; // 100x leverage
    mockMaxLeverage.mockReturnValue(veryHighLeverage);

    const amount = 100000000000000000000000n; // toBN("100000", 18)
    const creditManager = buildCreditManager({
      availableToBorrow: 1000n,
    });
    const result = calculateMaxStrategyDebt({
      targetToken: mockToken1,
      amount,
      creditManager,
      slippage: 100,
      constantLoss: 30n,
    });

    expect(result).toEqual(creditManager.availableToBorrow);
  });

  it("should ensure result is at least minDebt", () => {
    mockMaxLeverage.mockReturnValue(1n as LeverageFactor);
    const amount = 10000n;

    const result = calculateMaxStrategyDebt({
      targetToken: mockToken1,
      amount,
      creditManager: mockCreditManager,
      slippage: 100,
      constantLoss: 30n,
    });

    // Result should be at least minDebt
    expect(result).toEqual(mockCreditManager.minDebt);
  });

  it("should handle different slippage values correctly", () => {
    const maxLeverageValue = (10n * LEVERAGE_DECIMALS) as LeverageFactor;
    mockMaxLeverage.mockReturnValue(maxLeverageValue);

    const amount = 10000n;
    const highSlippage = 500; // 5%
    const result = calculateMaxStrategyDebt({
      targetToken: mockToken1,
      amount,
      creditManager: mockCreditManager,
      slippage: highSlippage,
      constantLoss: 30n,
    });

    expect(result).toEqual(94700n);
  });

  it("should handle different constantLoss values correctly", () => {
    const maxLeverageValue = (10n * LEVERAGE_DECIMALS) as LeverageFactor;
    mockMaxLeverage.mockReturnValue(maxLeverageValue);

    const amount = 10000n;
    const highConstantLoss = 500n; // Higher constant loss
    const result = calculateMaxStrategyDebt({
      targetToken: mockToken1,
      amount,
      creditManager: mockCreditManager,
      slippage: 100,
      constantLoss: highConstantLoss,
    });

    expect(result).toEqual(94000n);
  });

  it("should respect quota limit when quotaLeft is less than availableToBorrow", () => {
    const maxLeverageValue = (10n * LEVERAGE_DECIMALS) as LeverageFactor;
    mockMaxLeverage.mockReturnValue(maxLeverageValue);

    const quotaLimit = 50000n;
    const totalQuoted = 40000n;
    const amount = 10000n;
    const availableToBorrow = 100000n;

    const creditManagerWithQuota = buildCreditManager({
      availableToBorrow,
      quotas: {
        ...mockCreditManager.quotas,
        [mockToken1]: {
          ...mockCreditManager.quotas[mockToken1],
          limit: quotaLimit,
          totalQuoted,
        },
      },
    });

    const result = calculateMaxStrategyDebt({
      targetToken: mockToken1,
      amount,
      creditManager: creditManagerWithQuota,
      slippage: 100,
      constantLoss: 30n,
    });

    expect(result).toEqual(quotaLimit - totalQuoted);
  });

  it("should use availableToBorrow when quota does not exist for target token", () => {
    const maxLeverageValue = (10n * LEVERAGE_DECIMALS) as LeverageFactor;
    mockMaxLeverage.mockReturnValue(maxLeverageValue);

    const availableToBorrow = 75000n;
    const tokenWithoutQuota =
      "0x9999999999999999999999999999999999999999" as Address;

    const creditManagerWithoutQuota = buildCreditManager({
      availableToBorrow,
    });

    const result = calculateMaxStrategyDebt({
      targetToken: tokenWithoutQuota,
      amount: 10000n,
      creditManager: creditManagerWithoutQuota,
      slippage: 100,
      constantLoss: 30n,
    });

    expect(result).toEqual(creditManagerWithoutQuota.availableToBorrow);
  });

  it("should respect quotaLeft", () => {
    const maxLeverageValue = (10n * LEVERAGE_DECIMALS) as LeverageFactor;
    mockMaxLeverage.mockReturnValue(maxLeverageValue);

    const quotaLimit = 50000n;
    const totalQuoted = 10000n;
    const amount = 20000n;
    const availableToBorrow = 100000n;

    const creditManagerWithQuota = buildCreditManager({
      availableToBorrow,
      quotas: {
        ...mockCreditManager.quotas,
        [mockToken1]: {
          ...mockCreditManager.quotas[mockToken1],
          limit: quotaLimit,
          totalQuoted,
        },
      },
    });

    const result = calculateMaxStrategyDebt({
      targetToken: mockToken1,
      amount,
      creditManager: creditManagerWithQuota,
      slippage: 100,
      constantLoss: 30n,
    });

    expect(result).toEqual(quotaLimit - totalQuoted);
  });

  it("returns minDebt when quotaLeft would be negative (clamped to 0)", () => {
    const maxLeverageValue = (10n * LEVERAGE_DECIMALS) as LeverageFactor;
    mockMaxLeverage.mockReturnValue(maxLeverageValue);

    const quotaLimit = 50000n;
    const totalQuoted = 50001n;
    const amount = 20000n;
    const availableToBorrow = 100000n;

    const creditManagerWithQuota = buildCreditManager({
      availableToBorrow,
      quotas: {
        ...mockCreditManager.quotas,
        [mockToken1]: {
          ...mockCreditManager.quotas[mockToken1],
          limit: quotaLimit,
          totalQuoted,
        },
      },
    });

    const result = calculateMaxStrategyDebt({
      targetToken: mockToken1,
      amount,
      creditManager: creditManagerWithQuota,
      slippage: 100,
      constantLoss: 30n,
    });

    expect(result).toEqual(mockCreditManager.minDebt);
    expect(mockMaxLeverage).not.toHaveBeenCalled();
  });

  it("returns minDebt when quotaLimit is zero", () => {
    const maxLeverageValue = (10n * LEVERAGE_DECIMALS) as LeverageFactor;
    mockMaxLeverage.mockReturnValue(maxLeverageValue);

    const quotaLimit = 0n;
    const totalQuoted = 30000n;
    const amount = 20000n;
    const availableToBorrow = 100000n;

    const creditManagerWithQuota = buildCreditManager({
      availableToBorrow,
      quotas: {
        ...mockCreditManager.quotas,
        [mockToken1]: {
          ...mockCreditManager.quotas[mockToken1],
          limit: quotaLimit,
          totalQuoted,
        },
      },
    });

    const result = calculateMaxStrategyDebt({
      targetToken: mockToken1,
      amount,
      creditManager: creditManagerWithQuota,
      slippage: 100,
      constantLoss: 30n,
    });

    expect(result).toEqual(mockCreditManager.minDebt);
    expect(mockMaxLeverage).not.toHaveBeenCalled();
  });

  it("returns minDebt when effectiveMaxDebt is below minDebt", () => {
    mockCalculateLossCoefficient.mockReturnValueOnce(PERCENTAGE_FACTOR);

    const creditManager = buildCreditManager({
      minDebt: 500n,
      availableToBorrow: 50n,
      maxDebt: 200n,
    });

    const result = calculateMaxStrategyDebt({
      targetToken: mockToken1,
      amount: 0n,
      creditManager,
      slippage: 0,
      constantLoss: 0n,
    });

    expect(result).toEqual(creditManager.minDebt);
    expect(mockMaxLeverage).not.toHaveBeenCalled();
  });

  it("clamps leveraged result to minDebt when effective debt is smaller", () => {
    mockCalculateLossCoefficient.mockReturnValueOnce(PERCENTAGE_FACTOR);

    const creditManager = buildCreditManager({
      minDebt: 500n,
      availableToBorrow: 2_000n,
      maxDebt: 2_000n,
    });

    mockMaxLeverage.mockReturnValue(1n as LeverageFactor);

    const result = calculateMaxStrategyDebt({
      targetToken: mockToken1,
      amount: 100n,
      creditManager,
      slippage: 0,
      constantLoss: 0n,
    });

    expect(result).toEqual(creditManager.minDebt);
    expect(mockMaxLeverage).toHaveBeenCalledTimes(1);
  });

  it("ignores quota when swapCollateral is false", () => {
    const creditManagerWithQuota = buildCreditManager({
      availableToBorrow: 100_000n,
      quotas: {
        ...mockCreditManager.quotas,
        [mockToken1]: {
          ...mockCreditManager.quotas[mockToken1],
          limit: 50_000n,
          totalQuoted: 40_000n,
        },
      },
    });

    const result = calculateMaxStrategyDebt({
      targetToken: mockToken1,
      amount: 0n,
      creditManager: creditManagerWithQuota,
      slippage: 100,
      constantLoss: 30n,
      swapCollateral: false,
    });

    expect(result).toEqual(creditManagerWithQuota.availableToBorrow);
    expect(mockMaxLeverage).not.toHaveBeenCalled();
  });

  it("should respect quota limit when amount is zero", () => {
    const quotaLimit = 50_000n;
    const totalQuoted = 20_000n;
    const availableToBorrow = 100_000n;

    const creditManagerWithQuota = buildCreditManager({
      availableToBorrow,
      quotas: {
        ...mockCreditManager.quotas,
        [mockToken1]: {
          ...mockCreditManager.quotas[mockToken1],
          limit: quotaLimit,
          totalQuoted,
        },
      },
    });

    const result = calculateMaxStrategyDebt({
      targetToken: mockToken1,
      amount: 0n,
      creditManager: creditManagerWithQuota,
      slippage: 100,
      constantLoss: 30n,
    });

    expect(result).toBe(30000n);
    expect(mockMaxLeverage).not.toHaveBeenCalled();
  });
});
