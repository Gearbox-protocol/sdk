import { chainlinkReadableAggregatorAbi } from "../../abi";
import type { GearboxSDK } from "../../GearboxSDK";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed";

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
