import { Abi } from "viem";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed";
import { IPriceFeedContract } from "./types";

export abstract class AbstractDependentPriceFeed<
  const abi extends Abi | readonly unknown[],
> extends AbstractPriceFeedContract<abi> {
  underlyingPricefeeds: Array<IPriceFeedContract> = [];

  attach() {
    const data = this.factory.getPriceFeedData(this.address);

    this.priceFeedType = data.contractType;
    this.underlyingPricefeeds = data.underlyingFeeds.map((uf, index) =>
      this.factory.attachPriceFeed(uf, data.underlyingStalenessPeriods[index]),
    );

    this.parseCompressorSpecificParams(data.serializedParams);
    this.updatable = this.checkUpdatable();
  }

  checkUpdatable() {
    for (const feed of this.underlyingPricefeeds) {
      if (feed.updatable) {
        return true;
      }
    }
    return false;
  }
}
