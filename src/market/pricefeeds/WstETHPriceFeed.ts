import { iwstEthAbi, wstEthPriceFeedAbi } from "../../abi";
import type { AssetPriceFeedState } from "../../state";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";
import type { PriceFeedConstructorArgs } from "./AbstractPriceFeed";

type abi = typeof wstEthPriceFeedAbi;

export class WstETHPriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  readonly priceFeedType = "PF_WSTETH_ORACLE";

  protected constructor(args: PriceFeedConstructorArgs<abi>) {
    super({
      ...args,
      name: "WstETHPriceFeed",
      abi: wstEthPriceFeedAbi,
    });
  }

  public get state(): AssetPriceFeedState {
    return {
      ...this.contractData,
      contractType: this.priceFeedType,
      stalenessPeriod: this.stalenessPeriod,
      skipCheck: true,
      pricefeeds: [this.underlyingPricefeeds[0].state],
    };
  }

  public async getValue(): Promise<bigint> {
    return await this.provider.publicClient.readContract({
      abi: iwstEthAbi,
      address: this.lpContract,
      functionName: "stEthPerToken",
    });
  }
}
