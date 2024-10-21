import { bptWeightedPriceFeedAbi, iBalancerWeightedPoolAbi } from "../../abi";
import type { GearboxSDK } from "../../GearboxSDK";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed";

type abi = typeof bptWeightedPriceFeedAbi;

export class BalancerWeightedPriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  constructor(sdk: GearboxSDK, args: PartialPriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: "BalancerWeighedPriceFeed",
      abi: bptWeightedPriceFeedAbi,
    });
  }

  public override async getValue(): Promise<bigint> {
    return await this.sdk.provider.publicClient.readContract({
      abi: iBalancerWeightedPoolAbi,
      address: this.lpContract,
      functionName: "getRate",
    });
  }
}
