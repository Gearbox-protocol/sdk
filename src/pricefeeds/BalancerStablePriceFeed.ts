import { ADDRESS_0X0 } from "@gearbox-protocol/sdk-gov";

import { bptStablePriceFeedAbi, iBalancerStablePoolAbi } from "../../oracles";
import type { AssetPriceFeedState } from "../state/priceFactoryState";
import type { LPPriceFeedConstructorArgs } from "./AbstractLPPriceFeed";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";
import type { PriceFeedAttachArgs } from "./AbstractPriceFeed";

type abi = typeof bptStablePriceFeedAbi;

export class BalancerStablePriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  readonly priceFeedType = "PF_BALANCER_STABLE_LP_ORACLE";

  public get state(): AssetPriceFeedState {
    return {
      ...this.contractData,
      contractType: this.priceFeedType,
      stalenessPeriod: 0,
      skipCheck: true,
      pricefeeds: this.underlyingPricefeeds.map(pf => pf.state),
    };
  }

  static attach(args: PriceFeedAttachArgs): BalancerStablePriceFeedContract {
    const contract = new BalancerStablePriceFeedContract({
      ...args,
      lpContract: ADDRESS_0X0,
    });

    contract.attach();

    return contract;
  }

  protected constructor(args: LPPriceFeedConstructorArgs) {
    super({
      ...args,
      name: `BalancerStablePriceFeed`,
      abi: bptStablePriceFeedAbi,
    });
  }

  // TODO: Remove

  async getValue(): Promise<bigint> {
    return await this.v3.publicClient.readContract({
      abi: iBalancerStablePoolAbi,
      address: this.lpContract,
      functionName: "getRate",
    });
  }
}
