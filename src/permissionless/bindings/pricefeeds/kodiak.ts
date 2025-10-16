import { PriceFeedSetupParams } from "../../core";

export const kodiakPriceFeed: PriceFeedSetupParams = {
  contractType: "PRICE_FEED::KODIAK_ISLAND",
  version: 310,
  constructorParams: [
    {
      label: "kodiakIsland",
      type: { type: "address" },
    },
    {
      label: "priceFeed0",
      type: { type: "pricefeedParamsFlattened" },
    },
    {
      label: "priceFeed1",
      type: { type: "pricefeedParamsFlattened" },
    },
    {
      label: "descriptionTicker",
      type: { type: "string", maxLen: 32 },
    },
  ],
  stalenessPeriod: false,
};
