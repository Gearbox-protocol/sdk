import { bptStablePriceFeedAbi, iBalancerStablePoolAbi } from "../../abi";
import type { GearboxSDK } from "../../GearboxSDK";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed";

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
