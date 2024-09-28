import { curveUsdPriceFeedAbi, iCurvePoolAbi } from "../../abi";
import type { PriceFeedTreeNode } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import type { AssetPriceFeedState } from "../../state";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";

type abi = typeof curveUsdPriceFeedAbi;

export class CurveUSDPriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  readonly priceFeedType = "PF_CURVE_USD_ORACLE";

  constructor(sdk: GearboxSDK, args: PriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: "CurveUSDPriceFeed",
      abi: curveUsdPriceFeedAbi,
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

  async getValue(): Promise<bigint> {
    return await this.sdk.provider.publicClient.readContract({
      abi: iCurvePoolAbi,
      address: this.lpContract,
      functionName: "get_virtual_price",
    });
  }
}
