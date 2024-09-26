import { boundedPriceFeedAbi } from "../../oracles";
import { BoundedOracleState } from "../state/priceFactoryState";
import { AbstractDependentPriceFeed } from "./AbstractDependentPriceFeed";
import {
  PriceFeedAttachArgs,
  PriceFeedConstructorArgs,
} from "./AbstractPriceFeed";

type abi = typeof boundedPriceFeedAbi;

export class BoundedPriceFeedContract extends AbstractDependentPriceFeed<abi> {
  readonly priceFeedType = "PF_BOUNDED_ORACLE";

  upperBound: bigint;

  public get state(): BoundedOracleState {
    return {
      ...this.contractData,
      pricefeeds: [this.underlyingPricefeeds[0]!.state],
      upperBound: this.upperBound,
      contractType: this.priceFeedType,
      stalenessPeriod: this.stalenessPeriod,
      skipCheck: true,
    };
  }

  public static attach(
    args: PriceFeedAttachArgs,
    stalenessPeriod: number,
  ): BoundedPriceFeedContract {
    const data = args.factory.getPriceFeedData(args.address);

    const contract = new BoundedPriceFeedContract(args);
    contract.stalenessPeriod = stalenessPeriod;
    contract.attach();

    return contract;
  }

  protected constructor(args: PriceFeedConstructorArgs) {
    super({ ...args, name: `BoundedPriceFeed`, abi: boundedPriceFeedAbi });
  }
}
