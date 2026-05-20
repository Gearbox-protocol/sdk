import { describe, expect, it } from "vitest";
import {
  mockPrices,
  mockToken1,
  mockToken2,
  mockTokenData,
} from "../../../test-utils";
import { getDefaultAsset } from "../assets/assets";
import { getListWithAmountInTarget } from "./get-list-with-amount-in-target.js";

describe("getListWithAmountInTarget", () => {
  const targetToken = mockToken2;

  it("converts multiple assets to target token using prices", () => {
    const assets = [
      { ...getDefaultAsset(mockToken1), balance: 10n ** 18n },
      { ...getDefaultAsset(mockToken2), balance: 10n ** 18n },
    ];

    const result = getListWithAmountInTarget({
      assets,
      targetToken,
      prices: mockPrices,
      tokensList: mockTokenData,
    });

    expect(result).toHaveLength(2);
    expect(result[0].amountInTarget).toBe(1500000000000000000n);
    expect(result[1].amountInTarget).toBe(1000000000000000000n);
  });

  it("returns empty array for empty assets", () => {
    const result = getListWithAmountInTarget({
      assets: [],
      targetToken,
      prices: mockPrices,
      tokensList: mockTokenData,
    });

    expect(result).toEqual([]);
  });
});
