import type { PriceFeedSetupParams } from "../../core/index.js";

export const zeroPriceFeed: PriceFeedSetupParams = {
  contractType: "PRICE_FEED::ZERO",
  version: 311,
  constructorParams: [],
  stalenessPeriod: false,
};
