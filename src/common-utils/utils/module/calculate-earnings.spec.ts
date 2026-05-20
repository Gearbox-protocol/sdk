import { describe, expect, it } from "vitest";
import { toBN } from "../../../sdk/utils/formatter.js";
import { mockPrices, mockToken1, mockTokenData } from "../../../test-utils";
import { calculateEarnings } from "./calculate-earnings.js";
import { PERCENTAGE_FACTOR_1KK } from "./constants.js";

describe("calculateEarnings", () => {
  const targetToken = mockToken1;
  const tokensList = mockTokenData;
  const prices = mockPrices;
  const targetAmount = toBN("100", 18);

  const baseArgs = {
    overallAPYBigInt: 1n,
    targetAmount,
    targetToken,
    tokensList,
    prices,
  };

  it("returns null earnings when overallAPYBigInt is undefined", () => {
    expect(
      calculateEarnings({
        ...baseArgs,
        overallAPYBigInt: undefined,
      }),
    ).toEqual({ earnings: null, earningsUSD: null });

    expect(
      calculateEarnings({
        ...baseArgs,
        overallAPYBigInt: null,
      }),
    ).toEqual({ earnings: null, earningsUSD: null });
  });

  it("returns null earnings when targetAmount is missing or non-positive", () => {
    expect(
      calculateEarnings({
        ...baseArgs,
        targetAmount: undefined,
      }),
    ).toEqual({ earnings: null, earningsUSD: null });

    expect(
      calculateEarnings({
        ...baseArgs,
        targetAmount: 0n,
      }),
    ).toEqual({ earnings: null, earningsUSD: null });
  });

  it("calculates earnings and earningsUSD", () => {
    const overallAPYBigInt = 2n * BigInt(PERCENTAGE_FACTOR_1KK);
    const result = calculateEarnings({
      ...baseArgs,
      overallAPYBigInt,
      targetAmount,
      targetToken,
      tokensList,
      prices,
    });

    expect(result).toEqual({
      earnings: 200000000000000000000n,
      earningsUSD: 600000000000000000000n,
    });
  });
});
