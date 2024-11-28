import { decodeAbiParameters } from "viem";

import { boundedPriceFeedAbi } from "../../abi";
import type { GearboxSDK } from "../../GearboxSDK";
import type { BoundedOracleStateHuman } from "../../types";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed";

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
      contractType: "PF_BOUNDED_ORACLE",
      upperBound: this.upperBound,
    };
  }
}
