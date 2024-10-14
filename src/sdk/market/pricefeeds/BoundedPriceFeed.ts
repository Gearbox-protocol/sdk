import { boundedPriceFeedAbi } from "../../abi";
import type { PriceFeedTreeNode } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import type { BoundedOracleState } from "../../state";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed";

type abi = typeof boundedPriceFeedAbi;

export class BoundedPriceFeedContract extends AbstractPriceFeedContract<abi> {
  upperBound = 0n;

  constructor(sdk: GearboxSDK, args: PriceFeedTreeNode) {
    super(sdk, { ...args, name: "BoundedPriceFeed", abi: boundedPriceFeedAbi });
  }

  public get state(): Omit<BoundedOracleState, "stalenessPeriod"> {
    return {
      ...this.contractData,
      contractType: "PF_BOUNDED_ORACLE",
      pricefeeds: [this.underlyingPriceFeeds[0]!.state],
      upperBound: this.upperBound,
      skipCheck: true,
    };
  }
}