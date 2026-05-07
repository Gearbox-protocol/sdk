import { beforeEach, describe, expect, it, vi } from "vitest";
import { LEVERAGE_DECIMALS } from "../../../../sdk/index.js";

import { buildCreditManager, mockToken1 } from "../__test-utils.js";
import { calculateMaxLeverageFactor } from "./calculate-max-leverage-factor.js";
import type { LeverageFactor } from "./get-factor-from-leverage.js";
import { maxLeverage } from "./max-leverage.js";

vi.mock("./max-leverage.js", async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();

  return {
    ...actual,
    maxLeverage: vi.fn(),
  };
});

const mockMaxLeverage = vi.mocked(maxLeverage);

describe("calculateMaxLeverageFactor", () => {
  const mockCreditManager = buildCreditManager({
    liquidationThresholds: {
      [mockToken1]: 8000n,
    },
  });
  const mockCreditManagers = [mockCreditManager];

  beforeEach(() => {
    mockMaxLeverage.mockReturnValue(
      (10n * LEVERAGE_DECIMALS) as LeverageFactor,
    );
  });

  it("should calculate max leverage without leverage limit", () => {
    const result = calculateMaxLeverageFactor({
      targetToken: mockToken1,
      creditManagers: mockCreditManagers,
      slippage: 100, // 1%
      constantLoss: 30n,
    });

    expect(mockMaxLeverage).toHaveBeenCalledWith(
      mockToken1,
      mockCreditManagers,
    );
    expect(result).toBe(987n);
  });

  it("should apply leverage limit when provided", () => {
    const result = calculateMaxLeverageFactor({
      targetToken: mockToken1,
      creditManagers: mockCreditManagers,
      slippage: 100,
      constantLoss: 30n,
      leverageLimit: Number(3n * LEVERAGE_DECIMALS),
    });

    expect(result).toBe(3n * LEVERAGE_DECIMALS); // Limited by leverageLimit
  });

  it("should use default constant loss when not provided", () => {
    const result = calculateMaxLeverageFactor({
      targetToken: mockToken1,
      creditManagers: mockCreditManagers,
      slippage: 100,
    });

    expect(result).toBe(940n);
  });
});
