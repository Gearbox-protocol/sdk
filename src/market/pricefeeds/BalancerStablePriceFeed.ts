import { bptStablePriceFeedAbi, iBalancerStablePoolAbi } from "../../abi";
import type { PriceFeedTreeNode } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import type { AssetPriceFeedState } from "../../state";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";

type abi = typeof bptStablePriceFeedAbi;

export class BalancerStablePriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  readonly priceFeedType = "PF_BALANCER_STABLE_LP_ORACLE";

  constructor(sdk: GearboxSDK, args: PriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: "BalancerStablePriceFeed",
      abi: bptStablePriceFeedAbi,
    });
  }

  public get state(): Omit<AssetPriceFeedState, "stalenessPeriod"> {
    return {
      ...this.contractData,
      contractType: this.priceFeedType,
      skipCheck: true,
      pricefeeds: this.underlyingPriceFeeds.map(pf => pf.state),
    };
  }

  async getValue(): Promise<bigint> {
    return await this.sdk.provider.publicClient.readContract({
      abi: iBalancerStablePoolAbi,
      address: this.lpContract,
      functionName: "getRate",
    });
  }
}
