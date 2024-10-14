import { boundedPriceFeedAbi } from "../../abi";
import type { PriceFeedTreeNode } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import type { BoundedOracleStateHuman } from "../../types";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed";

type abi = typeof boundedPriceFeedAbi;

export class BoundedPriceFeedContract extends AbstractPriceFeedContract<abi> {
  upperBound = 0n;

  constructor(sdk: GearboxSDK, args: PriceFeedTreeNode) {
    super(sdk, { ...args, name: "BoundedPriceFeed", abi: boundedPriceFeedAbi });
  }

  public override stateHuman(
    raw = true,
  ): Omit<BoundedOracleStateHuman, "stalenessPeriod"> {
    return {
      ...super.stateHuman(raw),
      contractType: "PF_BOUNDED_ORACLE",
      upperBound: this.upperBound,
    };
  }
}
