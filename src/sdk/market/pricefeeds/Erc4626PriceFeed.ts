import { erc4626Abi } from "viem";

import { erc20Abi, erc4626PriceFeedAbi } from "../../abi";
import type { PriceFeedTreeNode } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";

type abi = typeof erc4626PriceFeedAbi;

export class Erc4626PriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  constructor(sdk: GearboxSDK, args: PriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: "ERC4626PriceFeed",
      abi: erc4626PriceFeedAbi,
    });
  }

  public override async getValue(): Promise<bigint> {
    const decimals = await this.sdk.provider.publicClient.readContract({
      abi: erc20Abi,
      address: this.lpContract,
      functionName: "decimals",
    });

    const price = await this.sdk.provider.publicClient.readContract({
      abi: erc4626Abi,
      address: this.lpContract,
      functionName: "convertToAssets",
      args: [10n ** BigInt(decimals)],
    });

    return price;
  }
}
