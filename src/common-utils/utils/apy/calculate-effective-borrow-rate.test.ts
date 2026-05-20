import type { Address } from "viem";
import { describe, expect, it } from "vitest";

import { mockToken1 } from "../../test-utils/index.js";
import { calculateEffectiveBorrowRate } from "./calculate-effective-borrow-rate.js";

describe("calculateEffectiveBorrowRate", () => {
  const mockAPYList: Record<Address, number> = {
    [mockToken1]: 1000, // 10% APY
  };

  it("returns baseRateWithFee when apyList is undefined", () => {
    const result = calculateEffectiveBorrowRate({
      underlyingTokenAddress: mockToken1,
      baseRateWithFee: 500, // 5%
      apyList: undefined,
    });

    expect(result).toBe(500);
  });

  it("returns baseRateWithFee when underlyingTokenAddress is undefined", () => {
    const result = calculateEffectiveBorrowRate({
      underlyingTokenAddress: undefined,
      baseRateWithFee: 500,
      apyList: mockAPYList,
    });

    expect(result).toBe(500);
  });

  it("returns baseRateWithFee when token is not found in apyList", () => {
    const unknownToken =
      "0x9999999999999999999999999999999999999999" as Address;
    const result = calculateEffectiveBorrowRate({
      underlyingTokenAddress: unknownToken,
      baseRateWithFee: 500,
      apyList: mockAPYList,
    });

    expect(result).toBe(500);
  });

  it("returns baseRateWithFee when token APY is negative", () => {
    const apyListWithNegative: Record<Address, number> = {
      [mockToken1]: -100,
    };

    const result = calculateEffectiveBorrowRate({
      underlyingTokenAddress: mockToken1,
      baseRateWithFee: 500,
      apyList: apyListWithNegative,
    });

    expect(result).toBe(500);
  });

  it("adds APY to baseRateWithFee when APY is positive", () => {
    const result = calculateEffectiveBorrowRate({
      underlyingTokenAddress: mockToken1,
      baseRateWithFee: 500, // 5%
      apyList: mockAPYList, // 10% APY
    });

    expect(result).toBe(1500); // 5% + 10% = 15%
  });

  it("handles default baseRateWithFee parameter", () => {
    const result = calculateEffectiveBorrowRate({
      underlyingTokenAddress: mockToken1,
      apyList: mockAPYList,
      baseRateWithFee: undefined,
    });

    expect(result).toBe(1000); // 0% + 10% = 10%
  });
});
