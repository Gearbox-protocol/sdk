import { bptStablePriceFeedAbi, iBalancerStablePoolAbi } from "../../abi";
import type { AssetPriceFeedState } from "../../state";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";
import type { PriceFeedConstructorArgs } from "./AbstractPriceFeed";

type abi = typeof bptStablePriceFeedAbi;

export class BalancerStablePriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  readonly priceFeedType = "PF_BALANCER_STABLE_LP_ORACLE";

  protected constructor(args: PriceFeedConstructorArgs<abi>) {
    super({
      ...args,
      name: "BalancerStablePriceFeed",
      abi: bptStablePriceFeedAbi,
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
      abi: iBalancerStablePoolAbi,
      address: this.lpContract,
      functionName: "getRate",
    });
  }
}
