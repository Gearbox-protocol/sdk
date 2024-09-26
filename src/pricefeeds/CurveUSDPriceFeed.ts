import { ADDRESS_0X0 } from "@gearbox-protocol/sdk-gov";

import { curveUsdPriceFeedAbi, iCurvePoolAbi } from "../../oracles";
import type { AssetPriceFeedState } from "../state/priceFactoryState";
import type { LPPriceFeedConstructorArgs } from "./AbstractLPPriceFeed";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";
import type { PriceFeedAttachArgs } from "./AbstractPriceFeed";

export class CurveUSDPriceFeedContract extends AbstractLPPriceFeedContract<
  typeof curveUsdPriceFeedAbi
> {
  readonly priceFeedType = "PF_CURVE_USD_ORACLE";

  public get state(): AssetPriceFeedState {
    return {
      ...this.contractData,
      contractType: this.priceFeedType,
      stalenessPeriod: this.stalenessPeriod,
      skipCheck: true,
      pricefeeds: [this.underlyingPricefeeds[0].state],
    };
  }

  static attach(args: PriceFeedAttachArgs): CurveUSDPriceFeedContract {
    const contract = new CurveUSDPriceFeedContract({
      ...args,
      lpContract: ADDRESS_0X0,
    });

    contract.attach();

    return contract;
  }

  protected constructor(args: LPPriceFeedConstructorArgs) {
    super({ ...args, name: `CurveUSDPriceFeed`, abi: curveUsdPriceFeedAbi });
  }

  async getValue(): Promise<bigint> {
    return await this.v3.publicClient.readContract({
      abi: iCurvePoolAbi,
      address: this.lpContract,
      functionName: "get_virtual_price",
    });
  }
}
