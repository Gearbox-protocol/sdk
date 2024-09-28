import { curveStableLpPriceFeedAbi, iCurvePoolAbi } from "../../abi";
import type { PriceFeedTreeNode } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import type { AssetPriceFeedState } from "../../state";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";

type abi = typeof curveStableLpPriceFeedAbi;

export class CurveStablePriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  constructor(sdk: GearboxSDK, args: PriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: "CurveStablePriceFeed",
      abi: curveStableLpPriceFeedAbi,
    });
  }

  public get state(): Omit<AssetPriceFeedState, "stalenessPeriod"> {
    if (this.priceFeedType !== "PF_CURVE_STABLE_LP_ORACLE") {
      throw new Error("Invalid feed type");
    }

    return {
      ...this.contractData,
      contractType: this.priceFeedType,
      skipCheck: true,
      pricefeeds: this.underlyingPriceFeeds.map(pf => pf.state),
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
