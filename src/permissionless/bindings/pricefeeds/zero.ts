import type { PriceFeedSetupParams } from "../../core/index.js";

export const zeroPriceFeed: PriceFeedSetupParams = {
  contractType: "PRICE_FEED::ZERO",
  version: 310,
  constructorParams: [],
  stalenessPeriod: false,
};
