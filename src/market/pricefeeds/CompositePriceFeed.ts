import { compositePriceFeedAbi } from "../../abi";
import type { AssetPriceFeedState } from "../../state";
import { AbstractDependentPriceFeed } from "./AbstractDependentPriceFeed";
import type { PriceFeedConstructorArgs } from "./AbstractPriceFeed";
import type { IPriceFeedContract } from "./types";

type abi = typeof compositePriceFeedAbi;

export class CompositePriceFeedContract extends AbstractDependentPriceFeed<abi> {
  readonly priceFeedType = "PF_COMPOSITE_ORACLE";

  protected constructor(args: PriceFeedConstructorArgs<abi>) {
    super({
      ...args,
      name: "CompositePriceFeed",
      abi: compositePriceFeedAbi,
      decimals: 8,
    });
  }

  get targetToBasePriceFeed(): IPriceFeedContract {
    return this.underlyingPricefeeds[0];
  }

  get baseToUsdPriceFeed(): IPriceFeedContract {
    return this.underlyingPricefeeds[1];
  }

  public get state(): AssetPriceFeedState {
    return {
      ...this.contractData,
      contractType: this.priceFeedType,
      pricefeeds: [
        this.targetToBasePriceFeed.state,
        this.baseToUsdPriceFeed.state,
      ],
      stalenessPeriod: this.stalenessPeriod,
      skipCheck: true,
    };
  }
}
