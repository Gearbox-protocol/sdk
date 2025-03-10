import { decodeAbiParameters } from "viem";

import { boundedPriceFeedAbi } from "../../abi/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { BoundedOracleStateHuman } from "../../types/index.js";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed.js";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed.js";

type abi = typeof boundedPriceFeedAbi;

export class BoundedPriceFeedContract extends AbstractPriceFeedContract<abi> {
  public readonly upperBound: bigint;

  constructor(sdk: GearboxSDK, args: PartialPriceFeedTreeNode) {
    super(sdk, { ...args, name: "BoundedPriceFeed", abi: boundedPriceFeedAbi });
    const decoder = decodeAbiParameters(
      [
        { type: "int256" }, //  upperBound
      ],
      args.baseParams.serializedParams,
    );
    this.upperBound = decoder[0];
  }

  public override stateHuman(
    raw = true,
  ): Omit<BoundedOracleStateHuman, "stalenessPeriod"> {
    return {
      ...super.stateHuman(raw),
      contractType: "PRICE_FEED::BOUNDED",
      upperBound: this.upperBound,
    };
  }
}
