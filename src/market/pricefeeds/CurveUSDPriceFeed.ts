import { curveUsdPriceFeedAbi, iCurvePoolAbi } from "../../abi";
import type { AssetPriceFeedState } from "../../state";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";
import type { PriceFeedConstructorArgs } from "./AbstractPriceFeed";

type abi = typeof curveUsdPriceFeedAbi;

export class CurveUSDPriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  readonly priceFeedType = "PF_CURVE_USD_ORACLE";

  protected constructor(args: PriceFeedConstructorArgs<abi>) {
    super({
      ...args,
      name: "CurveUSDPriceFeed",
      abi: curveUsdPriceFeedAbi,
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
    return await this.provider.publicClient.readContract({
      abi: iCurvePoolAbi,
      address: this.lpContract,
      functionName: "get_virtual_price",
    });
  }
}
