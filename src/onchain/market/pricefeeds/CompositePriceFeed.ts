import { compositePriceFeedAbi } from "../../abi/index.js";
import type { ConstructOptions } from "../../base/Construct.js";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed.js";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed.js";
import type { PriceFeedRef } from "./PriceFeedRef.js";

type abi = typeof compositePriceFeedAbi;

export class CompositePriceFeedContract extends AbstractPriceFeedContract<abi> {
  constructor(options: ConstructOptions, args: PartialPriceFeedTreeNode) {
    super(options, {
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
