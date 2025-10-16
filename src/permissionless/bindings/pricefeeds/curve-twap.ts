import { PriceFeedSetupParams } from "../../core";

export const curveTwapPriceFeed: PriceFeedSetupParams = {
  contractType: "PRICE_FEED::CURVE_TWAP",
  version: 310,
  constructorParams: [
    {
      label: "lowerBound ($)",
      type: { type: "int256", decimals: 8 },
      defaultValue: "0",
    },
    {
      label: "upperBound ($)",
      type: { type: "int256", decimals: 8 },
      defaultValue: "1",
    },
    {
      label: "oneOverZero",
      type: { type: "bool" },
      displayOrder: 5,
      defaultValue: false,
    },
    {
      label: "token",
      type: { type: "address" },
      displayOrder: 1,
    },
    {
      label: "pool",
      type: { type: "address" },
      displayOrder: 2,
    },
    {
      label: "underlyingPriceFeed",
      type: { type: "pricefeedParamsFlattened" },
      displayOrder: 3,
    },

    {
      label: "descriptionTicker",
      type: { type: "string", maxLen: 32 },
      displayOrder: 4,
    },
  ],
  stalenessPeriod: false,
};
