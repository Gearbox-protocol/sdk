import { describe, expect, it } from "vitest";
import { mockToken1 } from "../../test-utils/index.js";
import { validateBalance } from "./validate-balance.js";

describe("validateBalance", () => {
  it("returns null when all conditions are met", () => {
    const result = validateBalance({
      amount: 1000n,
      tokenAddress: mockToken1,
      maxAmount: 2000n,
      zeroCheck: true,
      single: false,
    });
    expect(result).toBeNull();
  });

  it("returns error when amount exceeds maxAmount", () => {
    const result = validateBalance({
      amount: 3000n,
      tokenAddress: mockToken1,
      maxAmount: 2000n,
      zeroCheck: true,
      single: false,
    });
    expect(result).toEqual({
      message: "insufficientFunds",
      token: mockToken1,
    });
  });

  it("returns error when amount is too small with zeroCheck", () => {
    const result = validateBalance({
      amount: 5n,
      tokenAddress: mockToken1,
      maxAmount: 2000n,
      zeroCheck: true,
      single: false,
    });
    expect(result).toEqual({
      message: "zeroBalance",
      token: mockToken1,
    });
  });

  it("returns null when zeroCheck is false and amount is small", () => {
    const result = validateBalance({
      amount: 5n,
      tokenAddress: mockToken1,
      maxAmount: 2000n,
      zeroCheck: false,
      single: false,
    });
    expect(result).toBeNull();
  });
});
