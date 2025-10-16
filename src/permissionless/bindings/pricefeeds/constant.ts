import { PriceFeedSetupParams } from "../../core";

export const constantPriceFeed: PriceFeedSetupParams = {
  contractType: "PRICE_FEED::CONSTANT",
  version: 310,
  constructorParams: [
    {
      label: "price ($)",
      type: { type: "int256", decimals: 8 },
    },
    {
      label: "descriptionTicker",
      type: { type: "string", maxLen: 32 },
    },
  ],
  stalenessPeriod: false,
};
