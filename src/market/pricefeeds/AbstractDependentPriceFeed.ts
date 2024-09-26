import type { Abi } from "viem";

import type { PriceFeedConstructorArgs } from "./AbstractPriceFeed";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed";
import type { IPriceFeedContract } from "./types";

export abstract class AbstractDependentPriceFeed<
  const abi extends Abi | readonly unknown[],
> extends AbstractPriceFeedContract<abi> {
  public underlyingPricefeeds: Array<IPriceFeedContract> = [];

  constructor(args: PriceFeedConstructorArgs<abi>) {
    super(args);
    this.underlyingPricefeeds = args.underlyingFeeds.map((uf, index) =>
      this.factory.attachPriceFeed(uf, args.underlyingStalenessPeriods[index]),
    );
  }

  public override updatableDependencies(): IPriceFeedContract[] {
    // in theory, it's possible for both "composite" price feed and it's underlying price feeds to be updatable
    return [
      ...super.updatableDependencies(),
      ...this.underlyingPricefeeds.flatMap(f => f.updatableDependencies()),
    ];
  }
}
