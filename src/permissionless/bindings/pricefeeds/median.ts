import type { PriceFeedSetupParams } from "../../core/index.js";

export const medianPriceFeed: PriceFeedSetupParams = {
  contractType: "PRICE_FEED::MEDIAN",
  version: 310,
  constructorParams: [
    {
      label: "underlyingPriceFeeds",
      type: { type: "pricefeedParamsFixed", qty: 3, minNonZero: 1 },
    },
    {
      label: "descriptionTicker",
      type: { type: "string", maxLen: 32 },
    },
  ],
  stalenessPeriod: false,
};
