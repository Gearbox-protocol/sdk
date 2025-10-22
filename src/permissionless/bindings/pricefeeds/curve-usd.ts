import type { PriceFeedSetupParams } from "../../core/index.js";

export const curveUsdPriceFeed: PriceFeedSetupParams = {
  contractType: "PRICE_FEED::CURVE_USD",
  version: 311,
  constructorParams: [
    {
      label: "priceStore",
      type: { type: "owner" },
    },
    {
      label: "crvUSD",
      type: { type: "address" },
    },
    {
      label: "pool",
      type: { type: "address" },
    },
    {
      label: "underlyingPriceFeed",
      type: { type: "pricefeedParamsFlattened" },
    },
  ],
  stalenessPeriod: false,
};
