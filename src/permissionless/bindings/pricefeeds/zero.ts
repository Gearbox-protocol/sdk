import { toHex } from "viem";
import { PriceFeedSetupParams } from "../../core";

export const zeroPriceFeed: PriceFeedSetupParams = {
  contractType: "PRICE_FEED::ZERO",
  version: 310,
  constructorParams: [],
  stalenessPeriod: false,
};
