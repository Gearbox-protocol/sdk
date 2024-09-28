import { bptWeightedPriceFeedAbi, iBalancerWeightedPoolAbi } from "../../abi";
import type { PriceFeedTreeNode } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import type { AssetPriceFeedState } from "../../state";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";

type abi = typeof bptWeightedPriceFeedAbi;

export class BalancerWeightedPriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  readonly priceFeedType = "PF_BALANCER_WEIGHTED_LP_ORACLE";

  constructor(sdk: GearboxSDK, args: PriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: "BalancerWeighedPriceFeed",
      abi: bptWeightedPriceFeedAbi,
    });
  }

  public get state(): AssetPriceFeedState {
    return {
      ...this.contractData,
      contractType: this.priceFeedType,
      stalenessPeriod: 0,
      skipCheck: true,
      pricefeeds: this.underlyingPriceFeeds.map(pf => pf.state),
    };
  }

  async getValue(): Promise<bigint> {
    return await this.sdk.provider.publicClient.readContract({
      abi: iBalancerWeightedPoolAbi,
      address: this.lpContract,
      functionName: "getRate",
    });
  }
}
