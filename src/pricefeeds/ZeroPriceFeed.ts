import { zeroPriceFeedAbi } from "../../oracles";
import type { AssetPriceFeedState } from "../state/priceFactoryState";
import type {
  PriceFeedAttachArgs,
  PriceFeedConstructorArgs,
} from "./AbstractPriceFeed";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed";

type abi = typeof zeroPriceFeedAbi;

export class ZeroPriceFeedContract extends AbstractPriceFeedContract<abi> {
  readonly priceFeedType = "PF_ZERO_ORACLE";
  decimals = 8;

  public get state(): AssetPriceFeedState {
    return {
      ...this.contractData,
      contractType: this.priceFeedType,
      skipCheck: true,
      stalenessPeriod: 0,
      pricefeeds: [],
    };
  }

  public static attach(args: PriceFeedAttachArgs): ZeroPriceFeedContract {
    return new ZeroPriceFeedContract(args);
  }

  protected constructor(args: PriceFeedConstructorArgs) {
    super({ ...args, name: `ZeroPriceFeed`, abi: zeroPriceFeedAbi });
  }
}
