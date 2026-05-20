import { describe, expect, it } from "vitest";
import { mockPrices, mockToken1, mockTokenData } from "../../../test-utils";
import { getDefaultAsset } from "../assets/assets";
import { addAmountInTarget } from "./add-amount-in-target.js";

describe("addAmountInTarget", () => {
  const fromToken = mockToken1;
  const toPrice = 4n;
  const toDecimals = 18;

  it("converts amount to target token using prices", () => {
    const asset = {
      ...getDefaultAsset(fromToken),
      balance: 10n ** 18n,
    };

    const result = addAmountInTarget(
      asset,
      mockTokenData,
      mockPrices,
      toPrice,
      toDecimals,
    );

    expect(result.amountInTarget).toBe(75000000000000000000000000n);
  });

  it("handles missing price data gracefully", () => {
    const asset = { ...getDefaultAsset(fromToken), balance: 10n ** 18n };
    const tokensList = {
      [fromToken]: mockTokenData[fromToken],
    };

    const result = addAmountInTarget(
      asset,
      tokensList,
      {},
      toPrice,
      toDecimals,
    );

    expect(result.amountInTarget).toBe(0n);
  });
});
