import type { PriceFeedSetupParams } from "../../core/index.js";

export const boundedPriceFeed: PriceFeedSetupParams = {
  contractType: "PRICE_FEED::BOUNDED",
  version: 311,
  constructorParams: [
    {
      label: "underlyingPriceFeed",
      type: { type: "pricefeedParamsFlattened" },
    },
    {
      label: "upperBound ($)",
      type: { type: "int256", decimals: 8 },
    },
    {
      label: "descriptionTicker",
      type: { type: "string", maxLen: 32 },
      displayOrder: 1,
    },
  ],
  stalenessPeriod: false,
};
