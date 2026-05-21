import { beforeEach, describe, expect, it, vi } from "vitest";
import { LEVERAGE_DECIMALS } from "../../../../sdk/constants/math.js";
import { buildCreditManager, mockToken1 } from "../../../test-utils/index.js";
import { calculateMaxLeverageFactor } from "./calculate-max-leverage-factor.js";
import { calculateMaxStrategyDebt } from "./calculate-max-strategy-debt.js";
import type { LeverageFactor } from "./get-factor-from-leverage.js";
import { getRecommendedDebt } from "./get-recommended-debt.js";

vi.mock("./calculate-max-strategy-debt");
vi.mock(
  "../../utils/strategies/leverage/calculate-max-leverage-factor.js",
  async () => {
    const actual = await vi.importActual(
      "../../utils/strategies/leverage/calculate-max-leverage-factor.js",
    );
    return {
      ...(actual as object),
      calculateMaxLeverageFactor: vi.fn(
        (
          actual as {
            calculateMaxLeverageFactor: typeof calculateMaxLeverageFactor;
          }
        ).calculateMaxLeverageFactor,
      ),
    };
  },
);

const mockCalculateMaxStrategyDebt = vi.mocked(calculateMaxStrategyDebt);
const mockCalculateMaxLeverageFactor = vi.mocked(calculateMaxLeverageFactor);

describe("getRecommendedDebt", () => {
  const mockCreditManager = buildCreditManager({});

  beforeEach(() => {
    mockCalculateMaxStrategyDebt.mockReset();
    mockCalculateMaxLeverageFactor.mockReset();
  });

  it("returns zero max debt with recommended factor when maxDebt is zero", () => {
    const maxDebt = 0n;
    mockCalculateMaxStrategyDebt.mockReturnValue(maxDebt);
    mockCalculateMaxLeverageFactor.mockReturnValue(300n as LeverageFactor); // recommended factor becomes 210

    const result = getRecommendedDebt({
      targetToken: mockToken1,
      amount: 1000n,
      creditManager: mockCreditManager,
      slippage: 100,
      maxDebtConstantLoss: 30n,
      swapCollateral: true,
      leverageLimit: undefined,
    });

    expect(mockCalculateMaxStrategyDebt).toHaveBeenCalledWith({
      targetToken: mockToken1,
      amount: 1000n,
      creditManager: mockCreditManager,
      slippage: 100,
      constantLoss: 30n,
      swapCollateral: true,
    });
    expect(mockCalculateMaxLeverageFactor).toHaveBeenCalledWith({
      targetToken: mockToken1,
      creditManagers: [mockCreditManager],
      slippage: 100,
      leverageLimit: undefined,
    });
    expect(result).toEqual({
      maxDebt: maxDebt,
      recommended: {
        factor: 210n as LeverageFactor,
        debt: maxDebt,
      },
    });
  });

  it("returns zero max debt with recommended factor when amount is zero", () => {
    const maxDebt = 500n;
    mockCalculateMaxStrategyDebt.mockReturnValue(maxDebt);
    mockCalculateMaxLeverageFactor.mockReturnValue(300n as LeverageFactor); // recommended factor becomes 210

    const result = getRecommendedDebt({
      targetToken: mockToken1,
      amount: 0n,
      creditManager: mockCreditManager,
      slippage: 100,
      maxDebtConstantLoss: 30n,
      swapCollateral: true,
      leverageLimit: undefined,
    });

    expect(mockCalculateMaxStrategyDebt).toHaveBeenCalledWith({
      targetToken: mockToken1,
      amount: 0n,
      creditManager: mockCreditManager,
      slippage: 100,
      constantLoss: 30n,
      swapCollateral: true,
    });
    expect(mockCalculateMaxLeverageFactor).toHaveBeenCalledWith({
      targetToken: mockToken1,
      creditManagers: [mockCreditManager],
      slippage: 100,
      leverageLimit: undefined,
    });
    expect(result).toEqual({
      maxDebt: maxDebt,
      recommended: {
        factor: 210n as LeverageFactor,
        debt: maxDebt,
      },
    });
  });

  it("returns recommended debt using adjusted constant loss when amount and maxDebt are positive", () => {
    const maxDebt = 5_000n;
    const recommendedMaxDebt = 3_500n;
    const amount = 1_000n;
    const leverageLimit = Number(4n * LEVERAGE_DECIMALS);

    mockCalculateMaxStrategyDebt
      .mockReturnValueOnce(maxDebt)
      .mockReturnValueOnce(recommendedMaxDebt);
    mockCalculateMaxLeverageFactor.mockReturnValue(450n as LeverageFactor);

    const result = getRecommendedDebt({
      targetToken: mockToken1,
      amount,
      creditManager: mockCreditManager,
      slippage: 50,
      maxDebtConstantLoss: 75n,
      swapCollateral: false,
      leverageLimit,
    });

    expect(mockCalculateMaxStrategyDebt).toHaveBeenNthCalledWith(1, {
      targetToken: mockToken1,
      amount,
      creditManager: mockCreditManager,
      slippage: 50,
      constantLoss: 75n,
      swapCollateral: false,
    });
    expect(mockCalculateMaxStrategyDebt).toHaveBeenNthCalledWith(2, {
      targetToken: mockToken1,
      amount,
      creditManager: mockCreditManager,
      slippage: 50,
      constantLoss: 3_400n,
      swapCollateral: false,
    });
    expect(mockCalculateMaxLeverageFactor).toHaveBeenCalledWith({
      targetToken: mockToken1,
      creditManagers: [mockCreditManager],
      slippage: 50,
      leverageLimit,
    });

    expect(result).toEqual({
      maxDebt,
      recommended: {
        factor: ((recommendedMaxDebt * LEVERAGE_DECIMALS) /
          amount) as LeverageFactor,
        debt: recommendedMaxDebt,
      },
    });
  });

  it("passes maxLeverageConstantLoss through to leverage calculation", () => {
    const maxDebt = 2_000n;
    const recommendedMaxDebt = 1_000n;
    const amount = 500n;
    const maxLeverageConstantLoss = 999n;
    const maxDebtConstantLoss = 55n;
    const recommendedDebtConstantLoss = 777n;

    mockCalculateMaxStrategyDebt
      .mockReturnValueOnce(maxDebt)
      .mockReturnValueOnce(recommendedMaxDebt);
    mockCalculateMaxLeverageFactor.mockReturnValue(420n as LeverageFactor);

    const result = getRecommendedDebt({
      targetToken: mockToken1,
      amount,
      creditManager: mockCreditManager,
      slippage: 25,
      maxLeverageConstantLoss,
      maxDebtConstantLoss,
      recommendedDebtConstantLoss,
      swapCollateral: true,
      leverageLimit: 123,
    });

    expect(mockCalculateMaxStrategyDebt).toHaveBeenNthCalledWith(1, {
      targetToken: mockToken1,
      amount,
      creditManager: mockCreditManager,
      slippage: 25,
      constantLoss: maxDebtConstantLoss,
      swapCollateral: true,
    });
    expect(mockCalculateMaxLeverageFactor).toHaveBeenCalledWith({
      targetToken: mockToken1,
      creditManagers: [mockCreditManager],
      slippage: 25,
      leverageLimit: 123,
      constantLoss: maxLeverageConstantLoss,
    });
    expect(mockCalculateMaxStrategyDebt).toHaveBeenNthCalledWith(2, {
      targetToken: mockToken1,
      amount,
      creditManager: mockCreditManager,
      slippage: 25,
      constantLoss: recommendedDebtConstantLoss,
      swapCollateral: true,
    });
    expect(result).toEqual({
      maxDebt,
      recommended: {
        factor: 200n as LeverageFactor,
        debt: recommendedMaxDebt,
      },
    });
  });

  it("uses custom recommendedDebtConstantLoss when provided", () => {
    const maxDebt = 10_000n;
    const recommendedMaxDebt = 6_000n;
    const amount = 2_000n;
    const recommendedDebtConstantLoss = 1_234n;

    mockCalculateMaxStrategyDebt
      .mockReturnValueOnce(maxDebt)
      .mockReturnValueOnce(recommendedMaxDebt);
    mockCalculateMaxLeverageFactor.mockReturnValue(800n as LeverageFactor);

    const result = getRecommendedDebt({
      targetToken: mockToken1,
      amount,
      creditManager: mockCreditManager,
      slippage: 15,
      maxDebtConstantLoss: 60n,
      maxLeverageConstantLoss: 70n,
      recommendedDebtConstantLoss,
      swapCollateral: false,
      leverageLimit: undefined,
    });

    expect(mockCalculateMaxStrategyDebt).toHaveBeenNthCalledWith(2, {
      targetToken: mockToken1,
      amount,
      creditManager: mockCreditManager,
      slippage: 15,
      constantLoss: recommendedDebtConstantLoss,
      swapCollateral: false,
    });
    expect(result.recommended.debt).toBe(recommendedMaxDebt);
    expect(result.recommended.factor).toBe(300n as LeverageFactor);
  });
});
