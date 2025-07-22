import { decodeAbiParameters } from "viem";
import { constantPriceFeedAbi } from "../../abi/oracles.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { ConstantOracleStateHuman } from "../../types/index.js";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed.js";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed.js";

type abi = typeof constantPriceFeedAbi;

export class ConstantPriceFeedContract extends AbstractPriceFeedContract<abi> {
  public readonly price: bigint;

  constructor(sdk: GearboxSDK, args: PartialPriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: "ConstantPriceFeed",
      abi: constantPriceFeedAbi,
      decimals: 8, // always 8 for USD price feeds
    });
    const decoder = decodeAbiParameters(
      [
        { type: "int256" }, //  price
      ],
      args.baseParams.serializedParams,
    );
    this.price = decoder[0];
  }

  public override stateHuman(
    raw = true,
  ): Omit<ConstantOracleStateHuman, "stalenessPeriod"> {
    return {
      ...super.stateHuman(raw),
      contractType: "PRICE_FEED::CONSTANT",
      price: this.price,
    };
  }
}
