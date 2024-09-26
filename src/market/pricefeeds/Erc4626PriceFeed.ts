import { erc4626Abi } from "viem";

import { erc20Abi, erc4626PriceFeedAbi } from "../../abi";
import type { AssetPriceFeedState } from "../../state";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";
import type { PriceFeedConstructorArgs } from "./AbstractPriceFeed";

type abi = typeof erc4626PriceFeedAbi;

export class Erc4626PriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  readonly priceFeedType = "PF_ERC4626_ORACLE";

  protected constructor(args: PriceFeedConstructorArgs<abi>) {
    super({
      ...args,
      name: "ERC4626PriceFeed",
      abi: erc4626PriceFeedAbi,
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

  async getValue(): Promise<bigint> {
    const decimals = await this.provider.publicClient.readContract({
      abi: erc20Abi,
      address: this.lpContract,
      functionName: "decimals",
    });

    const price = await this.provider.publicClient.readContract({
      abi: erc4626Abi,
      address: this.lpContract,
      functionName: "convertToAssets",
      args: [10n ** BigInt(decimals)],
    });

    return price;
  }
}
