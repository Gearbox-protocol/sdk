import { iwstEthAbi, wstEthPriceFeedAbi } from "../../abi/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed.js";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed.js";

type abi = typeof wstEthPriceFeedAbi;

export class WstETHPriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  constructor(sdk: GearboxSDK, args: PartialPriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: "WstETHPriceFeed",
      abi: wstEthPriceFeedAbi,
    });
  }

  public override async getValue(): Promise<bigint> {
    return await this.sdk.client.readContract({
      abi: iwstEthAbi,
      address: this.lpContract,
      functionName: "stEthPerToken",
    });
  }
}
