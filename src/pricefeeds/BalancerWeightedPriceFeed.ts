import { ADDRESS_0X0, PriceFeedType } from "@gearbox-protocol/sdk-gov";

import {
  bptWeightedPriceFeedAbi,
  iBalancerWeightedPoolAbi,
} from "../../oracles";
import type { AssetPriceFeedState } from "../state/priceFactoryState";
import type { PriceFeedAttachArgs } from ".";
import type { LPPriceFeedConstructorArgs } from "./AbstractLPPriceFeed";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";

type abi = typeof bptWeightedPriceFeedAbi;

export class BalancerWeightedPriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  readonly priceFeedType = "PF_BALANCER_WEIGHTED_LP_ORACLE";

  public get state(): AssetPriceFeedState {
    return {
      ...this.contractData,
      contractType: this.priceFeedType,
      stalenessPeriod: 0,
      skipCheck: true,
      pricefeeds: this.underlyingPricefeeds.map(pf => pf.state),
    };
  }

  static attach(args: PriceFeedAttachArgs): BalancerWeightedPriceFeedContract {
    const contract = new BalancerWeightedPriceFeedContract({
      ...args,
      lpContract: ADDRESS_0X0,
    });
    contract.attach();
    return contract;
  }

  protected constructor(args: LPPriceFeedConstructorArgs) {
    super({
      ...args,
      name: `BalancerWeighedPriceFeed`,
      abi: bptWeightedPriceFeedAbi,
    });
  }

  async getValue(): Promise<bigint> {
    return await this.v3.publicClient.readContract({
      abi: iBalancerWeightedPoolAbi,
      address: this.lpContract,
      functionName: "getRate",
    });
  }
}
