import { ADDRESS_0X0 } from "@gearbox-protocol/sdk-gov";
import { curveCryptoLpPriceFeedAbi, iCurvePoolAbi } from "../../oracles";
import { AssetPriceFeedState } from "../state/priceFactoryState";
import {
  AbstractLPPriceFeedContract,
  LPPriceFeedConstructorArgs,
} from "./AbstractLPPriceFeed";
import { PriceFeedAttachArgs } from "./AbstractPriceFeed";

type abi = typeof curveCryptoLpPriceFeedAbi;

export class CurveCryptoPriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  readonly priceFeedType = "PF_CURVE_CRYPTO_LP_ORACLE";

  public get state(): AssetPriceFeedState {
    return {
      ...this.contractData,
      contractType: this.priceFeedType,
      stalenessPeriod: 0,
      skipCheck: true,
      pricefeeds: this.underlyingPricefeeds.map(pf => pf.state),
    };
  }

  static attach(args: PriceFeedAttachArgs): CurveCryptoPriceFeedContract {
    const contract = new CurveCryptoPriceFeedContract({
      ...args,
      lpContract: ADDRESS_0X0,
    });

    contract.attach();

    return contract;
  }

  protected constructor(args: LPPriceFeedConstructorArgs) {
    super({
      ...args,
      name: `CurveCryptoPriceFeed`,
      abi: curveCryptoLpPriceFeedAbi,
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
