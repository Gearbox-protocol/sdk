import { curveStableLpPriceFeedAbi, iCurvePoolAbi } from "../../abi";
import type { AssetPriceFeedState } from "../../state";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";
import type { PriceFeedConstructorArgs } from "./AbstractPriceFeed";

type abi = typeof curveStableLpPriceFeedAbi;

export class CurveStablePriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  protected constructor(args: PriceFeedConstructorArgs<abi>) {
    super({
      ...args,
      name: "CurveStablePriceFeed",
      abi: curveStableLpPriceFeedAbi,
    });
  }

  public get state(): AssetPriceFeedState {
    if (this.priceFeedType !== "PF_CURVE_STABLE_LP_ORACLE") {
      throw new Error("Invalid feed type");
    }

    return {
      ...this.contractData,
      contractType: this.priceFeedType,
      stalenessPeriod: 0,
      skipCheck: true,
      pricefeeds: this.underlyingPricefeeds.map(pf => pf.state),
    };
  }

  async getValue(): Promise<bigint> {
    return await this.provider.publicClient.readContract({
      abi: iCurvePoolAbi,
      address: this.lpContract,
      functionName: "get_virtual_price",
    });
  }
}
