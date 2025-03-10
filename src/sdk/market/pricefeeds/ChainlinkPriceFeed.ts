import { chainlinkReadableAggregatorAbi } from "../../abi/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed.js";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed.js";

type abi = typeof chainlinkReadableAggregatorAbi;

export class ChainlinkPriceFeedContract extends AbstractPriceFeedContract<abi> {
  constructor(sdk: GearboxSDK, args: PartialPriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: "ChainlinkPriceFeed",
      abi: chainlinkReadableAggregatorAbi,
    });
  }
}
