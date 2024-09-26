import { bptWeightedPriceFeedAbi, iBalancerWeightedPoolAbi } from "../../abi";
import type { AssetPriceFeedState } from "../../state";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";
import type { PriceFeedConstructorArgs } from "./AbstractPriceFeed";

type abi = typeof bptWeightedPriceFeedAbi;

export class BalancerWeightedPriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  readonly priceFeedType = "PF_BALANCER_WEIGHTED_LP_ORACLE";

  protected constructor(args: PriceFeedConstructorArgs<abi>) {
    super({
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
      pricefeeds: this.underlyingPricefeeds.map(pf => pf.state),
    };
  }

  async getValue(): Promise<bigint> {
    return await this.provider.publicClient.readContract({
      abi: iBalancerWeightedPoolAbi,
      address: this.lpContract,
      functionName: "getRate",
    });
  }
}
