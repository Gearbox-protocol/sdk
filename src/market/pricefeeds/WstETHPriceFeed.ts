import { iwstEthAbi, wstEthPriceFeedAbi } from "../../abi";
import type { PriceFeedTreeNode } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import type { AssetPriceFeedState } from "../../state";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";

type abi = typeof wstEthPriceFeedAbi;

export class WstETHPriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  readonly priceFeedType = "PF_WSTETH_ORACLE";

  constructor(sdk: GearboxSDK, args: PriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: "WstETHPriceFeed",
      abi: wstEthPriceFeedAbi,
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
    return await this.sdk.provider.publicClient.readContract({
      abi: iwstEthAbi,
      address: this.lpContract,
      functionName: "stEthPerToken",
    });
  }
}
