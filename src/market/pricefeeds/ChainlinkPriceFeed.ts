import { chainlinkReadableAggregatorAbi } from "../../abi";
import type { AssetPriceFeedState } from "../../state";
import type { PriceFeedConstructorArgs } from "./AbstractPriceFeed";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed";

type abi = typeof chainlinkReadableAggregatorAbi;

export class ChainlinkPriceFeedContract extends AbstractPriceFeedContract<abi> {
  readonly priceFeedType = "PF_CHAINLINK_ORACLE";

  protected constructor(args: PriceFeedConstructorArgs<abi>) {
    super({
      ...args,
      name: "ChainlinkPriceFeed",
      abi: chainlinkReadableAggregatorAbi,
    });
  }

  public get state(): AssetPriceFeedState {
    return {
      ...this.contractData,
      contractType: this.priceFeedType,
      stalenessPeriod: this.stalenessPeriod,
      skipCheck: false,
      pricefeeds: [],
    };
  }
}
