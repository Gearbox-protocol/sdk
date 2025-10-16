import type { PriceFeedSetupParams } from "../../core/index.js";

export const compositePriceFeed: PriceFeedSetupParams = {
  contractType: "PRICE_FEED::COMPOSITE",
  version: 310,
  constructorParams: [
    {
      label: "underlyingPriceFeed",
      type: { type: "pricefeedParamsFixed", qty: 2 },
    },
    {
      label: "descriptionTicker",
      type: { type: "string", maxLen: 32 },
      displayOrder: 1,
    },
  ],
  stalenessPeriod: false,
};
