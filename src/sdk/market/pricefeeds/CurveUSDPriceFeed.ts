import { curveUsdPriceFeedAbi, iCurvePoolAbi } from "../../abi/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed.js";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed.js";

type abi = typeof curveUsdPriceFeedAbi;

export class CurveUSDPriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  constructor(sdk: GearboxSDK, args: PartialPriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: "CurveUSDPriceFeed",
      abi: curveUsdPriceFeedAbi,
    });
  }

  public override async getValue(): Promise<bigint> {
    return await this.sdk.provider.publicClient.readContract({
      abi: iCurvePoolAbi,
      address: this.lpContract,
      functionName: "get_virtual_price",
    });
  }
}
