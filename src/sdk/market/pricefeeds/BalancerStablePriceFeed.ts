import {
  bptStablePriceFeedAbi,
  iBalancerStablePoolAbi,
} from "../../abi/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed.js";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed.js";

type abi = typeof bptStablePriceFeedAbi;

export class BalancerStablePriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  constructor(sdk: GearboxSDK, args: PartialPriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: "BalancerStablePriceFeed",
      abi: bptStablePriceFeedAbi,
    });
  }

  public override async getValue(): Promise<bigint> {
    return await this.sdk.provider.publicClient.readContract({
      abi: iBalancerStablePoolAbi,
      address: this.lpContract,
      functionName: "getRate",
    });
  }
}
