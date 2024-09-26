import { iMellowVaultAbi, mellowLrtPriceFeedAbi } from "../../abi";
import type { AssetPriceFeedState } from "../../state";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";
import type { PriceFeedConstructorArgs } from "./AbstractPriceFeed";

type abi = typeof mellowLrtPriceFeedAbi;

export class MellowLRTPriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  readonly priceFeedType = "PF_MELLOW_LRT_ORACLE";

  protected constructor(args: PriceFeedConstructorArgs<abi>) {
    super({
      ...args,
      name: "MellowLRTPriceFeed",
      abi: mellowLrtPriceFeedAbi,
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
    const stack = await this.provider.publicClient.readContract({
      abi: iMellowVaultAbi,
      address: this.lpContract,
      functionName: "calculateStack",
    });

    return (stack.totalValue * BigInt(1e18)) / stack.totalSupply;
  }
}
