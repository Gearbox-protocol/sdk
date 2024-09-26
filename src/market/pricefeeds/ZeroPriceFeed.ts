import { zeroPriceFeedAbi } from "../../abi";
import type { AssetPriceFeedState } from "../../state";
import type { PriceFeedConstructorArgs } from "./AbstractPriceFeed";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed";

type abi = typeof zeroPriceFeedAbi;

export class ZeroPriceFeedContract extends AbstractPriceFeedContract<abi> {
  readonly priceFeedType = "PF_ZERO_ORACLE";

  protected constructor(args: PriceFeedConstructorArgs<abi>) {
    super({
      ...args,
      name: "ZeroPriceFeed",
      abi: zeroPriceFeedAbi,
      decimals: 8,
    });
  }

  public get state(): AssetPriceFeedState {
    return {
      ...this.contractData,
      contractType: this.priceFeedType,
      skipCheck: true,
      stalenessPeriod: 0,
      pricefeeds: [],
    };
  }
}
