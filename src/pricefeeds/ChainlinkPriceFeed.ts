import { chainlinkReadableAggregatorAbi } from "../../oracles";
import type { AssetPriceFeedState } from "../state/priceFactoryState";
import type {
  PriceFeedAttachArgs,
  PriceFeedConstructorArgs,
} from "./AbstractPriceFeed";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed";

type abi = typeof chainlinkReadableAggregatorAbi;
export class ChainlinkPriceFeedContract extends AbstractPriceFeedContract<abi> {
  readonly priceFeedType = "PF_CHAINLINK_ORACLE";

  public get state(): AssetPriceFeedState {
    return {
      ...this.contractData,
      contractType: this.priceFeedType,
      stalenessPeriod: this.stalenessPeriod,
      skipCheck: false,
      pricefeeds: [],
    };
  }

  static attach(
    args: PriceFeedAttachArgs,
    stalenessPeriod: number,
  ): ChainlinkPriceFeedContract {
    const contract = new ChainlinkPriceFeedContract(args);
    contract.stalenessPeriod = stalenessPeriod;
    contract.decimals = args.factory.getPriceFeedData(args.address).decimals;

    return contract;
  }

  protected constructor(args: PriceFeedConstructorArgs) {
    super({
      ...args,
      name: "ChainlinkPriceFeed",
      abi: chainlinkReadableAggregatorAbi,
    });
  }
}
