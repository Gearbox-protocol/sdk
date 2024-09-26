import { iyVaultAbi, yearnPriceFeedAbi } from "../../abi";
import type { AssetPriceFeedState } from "../../state";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";
import type { PriceFeedConstructorArgs } from "./AbstractPriceFeed";

type abi = typeof yearnPriceFeedAbi;

export class YearnPriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  readonly priceFeedType = "PF_YEARN_ORACLE";

  protected constructor(args: PriceFeedConstructorArgs<abi>) {
    super({
      ...args,
      name: "YearnPriceFeed",
      abi: yearnPriceFeedAbi,
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
      abi: iyVaultAbi,
      address: this.lpContract,
      functionName: "pricePerShare",
    });
  }
}
