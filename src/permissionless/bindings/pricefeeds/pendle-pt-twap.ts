import type { PriceFeedSetupParams } from "../../core/index.js";

export const pendlePtTwapPriceFeed: PriceFeedSetupParams = {
  contractType: "PRICE_FEED::PENDLE_PT_TWAP",
  version: 311,
  constructorParams: [
    {
      label: "market",
      type: { type: "address" },
    },
    {
      label: "underlyingPriceFeed",
      type: { type: "pricefeedParamsFlattened" },
    },
    {
      label: "twapWindow",
      type: { type: "uint32" },
    },
    {
      label: "priceToSY",
      type: { type: "bool" },
      defaultValue: false,
    },
  ],
  stalenessPeriod: false,
};
