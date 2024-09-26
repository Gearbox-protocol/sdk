import { boundedPriceFeedAbi } from "../../abi";
import type { BoundedOracleState } from "../../state";
import { AbstractDependentPriceFeed } from "./AbstractDependentPriceFeed";
import type { PriceFeedConstructorArgs } from "./AbstractPriceFeed";

type abi = typeof boundedPriceFeedAbi;

export class BoundedPriceFeedContract extends AbstractDependentPriceFeed<abi> {
  readonly priceFeedType = "PF_BOUNDED_ORACLE";

  upperBound = 0n;

  protected constructor(args: PriceFeedConstructorArgs<abi>) {
    super({ ...args, name: "BoundedPriceFeed", abi: boundedPriceFeedAbi });
  }

  public get state(): BoundedOracleState {
    return {
      ...this.contractData,
      pricefeeds: [this.underlyingPricefeeds[0]!.state],
      upperBound: this.upperBound,
      contractType: this.priceFeedType,
      stalenessPeriod: this.stalenessPeriod,
      skipCheck: true,
    };
  }
}
