import type { PriceFeedSetupParams } from "../../core";

export const externalPriceFeed: PriceFeedSetupParams = {
  contractType: "PRICE_FEED::EXTERNAL",
  version: 0,
  constructorParams: [
    {
      label: "priceFeedAddress",
      type: { type: "address" },
    },
  ],
  stalenessPeriod: true,
};
