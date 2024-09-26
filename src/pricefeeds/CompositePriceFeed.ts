import { compositePriceFeedAbi } from "../../oracles";
import type { AssetPriceFeedState } from "../state/priceFactoryState";
import { AbstractDependentPriceFeed } from "./AbstractDependentPriceFeed";
import type {
  PriceFeedAttachArgs,
  PriceFeedConstructorArgs,
} from "./AbstractPriceFeed";
import type { IPriceFeedContract } from "./types";

type abi = typeof compositePriceFeedAbi;

export class CompositePriceFeedContract extends AbstractDependentPriceFeed<abi> {
  readonly priceFeedType = "PF_COMPOSITE_ORACLE";
  decimals = 8;

  get targetToBasePriceFeed(): IPriceFeedContract {
    return this.underlyingPricefeeds[0];
  }

  get baseToUsdPriceFeed(): IPriceFeedContract {
    return this.underlyingPricefeeds[1];
  }

  public get state(): AssetPriceFeedState {
    return {
      ...this.contractData,
      contractType: this.priceFeedType,
      pricefeeds: [
        this.targetToBasePriceFeed.state,
        this.baseToUsdPriceFeed.state,
      ],
      stalenessPeriod: this.stalenessPeriod,
      skipCheck: true,
    };
  }

  public static attach(args: PriceFeedAttachArgs): CompositePriceFeedContract {
    const contract = new CompositePriceFeedContract(args);
    contract.attach();

    return contract;
  }

  protected constructor(args: PriceFeedConstructorArgs) {
    super({ ...args, name: `CompositePriceFeed`, abi: compositePriceFeedAbi });
  }
}
