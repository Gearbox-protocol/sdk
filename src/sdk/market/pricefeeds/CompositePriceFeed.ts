import { compositePriceFeedAbi } from "../../abi";
import type { GearboxSDK } from "../../GearboxSDK";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed";
import type { PriceFeedRef } from "./PriceFeedRef";

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
