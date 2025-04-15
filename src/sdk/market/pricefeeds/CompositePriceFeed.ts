import { compositePriceFeedAbi } from "../../abi/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed.js";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed.js";
import type { PriceFeedRef } from "./PriceFeedRef.js";

type abi = typeof compositePriceFeedAbi;

export class CompositePriceFeedContract extends AbstractPriceFeedContract<abi> {
  constructor(sdk: GearboxSDK, args: PartialPriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: "CompositePriceFeed",
      abi: compositePriceFeedAbi,
    });
  }

  public get targetToBasePriceFeed(): PriceFeedRef {
    return this.underlyingPriceFeeds[0];
  }

  public get baseToUsdPriceFeed(): PriceFeedRef {
    return this.underlyingPriceFeeds[1];
  }
}
