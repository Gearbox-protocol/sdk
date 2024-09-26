import { ADDRESS_0X0 } from "@gearbox-protocol/sdk-gov";
import { curveStableLpPriceFeedAbi, iCurvePoolAbi } from "../../oracles";
import { AssetPriceFeedState } from "../state/priceFactoryState";
import {
  AbstractLPPriceFeedContract,
  LPPriceFeedConstructorArgs,
} from "./AbstractLPPriceFeed";
import { PriceFeedAttachArgs } from "./AbstractPriceFeed";

type abi = typeof curveStableLpPriceFeedAbi;
export class CurveStablePriceFeedContract extends AbstractLPPriceFeedContract<abi> {
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

  static attach(args: PriceFeedAttachArgs): CurveStablePriceFeedContract {
    const contract = new CurveStablePriceFeedContract({
      ...args,
      lpContract: ADDRESS_0X0,
    });

    contract.attach();

    return contract;
  }

  protected constructor(args: LPPriceFeedConstructorArgs) {
    super({
      ...args,
      name: `CurveStablePriceFeed`,
      abi: curveStableLpPriceFeedAbi,
    });
  }

  async getValue(): Promise<bigint> {
    return await this.v3.publicClient.readContract({
      abi: iCurvePoolAbi,
      address: this.lpContract,
      functionName: "get_virtual_price",
    });
  }
}
