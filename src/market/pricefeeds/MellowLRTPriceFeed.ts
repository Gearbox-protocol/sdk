import { iMellowVaultAbi, mellowLrtPriceFeedAbi } from "../../abi";
import type { PriceFeedTreeNode } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import type { AssetPriceFeedState } from "../../state";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";

type abi = typeof mellowLrtPriceFeedAbi;

export class MellowLRTPriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  readonly priceFeedType = "PF_MELLOW_LRT_ORACLE";

  constructor(sdk: GearboxSDK, args: PriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: "MellowLRTPriceFeed",
      abi: mellowLrtPriceFeedAbi,
    });
  }

  public get state(): Omit<AssetPriceFeedState, "stalenessPeriod"> {
    return {
      ...this.contractData,
      contractType: this.priceFeedType,
      skipCheck: true,
      pricefeeds: [this.underlyingPriceFeeds[0].state],
    };
  }

  public async getValue(): Promise<bigint> {
    const stack = await this.sdk.provider.publicClient.readContract({
      abi: iMellowVaultAbi,
      address: this.lpContract,
      functionName: "calculateStack",
    });

    return (stack.totalValue * BigInt(1e18)) / stack.totalSupply;
  }
}
