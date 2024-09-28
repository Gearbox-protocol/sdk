import { compositePriceFeedAbi } from "../../abi";
import type { PriceFeedTreeNode } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import type { AssetPriceFeedState } from "../../state";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed";
import type { PriceFeedRef } from "./PriceFeedRef";

type abi = typeof compositePriceFeedAbi;

export class CompositePriceFeedContract extends AbstractPriceFeedContract<abi> {
  readonly priceFeedType = "PF_COMPOSITE_ORACLE";

  constructor(sdk: GearboxSDK, args: PriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: "CompositePriceFeed",
      abi: compositePriceFeedAbi,
      decimals: 8,
    });
  }

  get targetToBasePriceFeed(): PriceFeedRef {
    return this.underlyingPriceFeeds[0];
  }

  get baseToUsdPriceFeed(): PriceFeedRef {
    return this.underlyingPriceFeeds[1];
  }

  public get state(): Omit<AssetPriceFeedState, "stalenessPeriod"> {
    return {
      ...this.contractData,
      contractType: this.priceFeedType,
      pricefeeds: [
        this.targetToBasePriceFeed.state,
        this.baseToUsdPriceFeed.state,
      ],
      skipCheck: true,
    };
  }
}
