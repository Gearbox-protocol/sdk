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
    // https://github.com/Gearbox-protocol/periphery-v3/blob/8ae4c5f8835de9961c55403fcc810516cea3e29c/contracts/serializers/oracles/BoundedPriceFeedSerializer.sol#L13
    // abi.encode(pf.upperBound());
    // https://github.com/Gearbox-protocol/oracles-v3/blob/fc8d3a0ab5bd7eb50ce3f6b87dde5cd3d887bafe/contracts/oracles/BoundedPriceFeed.sol#L59
    // abi.encode(upperBound);
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
