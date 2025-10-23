import { curveStableLpPriceFeedAbi, iCurvePoolAbi } from "../../abi/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed.js";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed.js";

type abi = typeof curveStableLpPriceFeedAbi;

export class CurveStablePriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  constructor(sdk: GearboxSDK, args: PartialPriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: "CurveStablePriceFeed",
      abi: curveStableLpPriceFeedAbi,
    });
  }

  public override async getValue(): Promise<bigint> {
    return await this.sdk.client.readContract({
      abi: iCurvePoolAbi,
      address: this.lpContract,
      functionName: "get_virtual_price",
    });
  }
}
