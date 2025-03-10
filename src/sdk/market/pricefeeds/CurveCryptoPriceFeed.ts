import { curveCryptoLpPriceFeedAbi, iCurvePoolAbi } from "../../abi";
import type { GearboxSDK } from "../../GearboxSDK";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed";

type abi = typeof curveCryptoLpPriceFeedAbi;

export class CurveCryptoPriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  constructor(sdk: GearboxSDK, args: PartialPriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: "CurveCryptoPriceFeed",
      abi: curveCryptoLpPriceFeedAbi,
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
