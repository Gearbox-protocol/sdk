import { ADDRESS_0X0 } from "@gearbox-protocol/sdk-gov";
import { iwstEthAbi, wstEthPriceFeedAbi } from "../../oracles";
import { AssetPriceFeedState } from "../state/priceFactoryState";
import {
  AbstractLPPriceFeedContract,
  LPPriceFeedConstructorArgs,
} from "./AbstractLPPriceFeed";
import { PriceFeedAttachArgs } from "./AbstractPriceFeed";

type abi = typeof wstEthPriceFeedAbi;

export class WstETHPriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  readonly priceFeedType = "PF_WSTETH_ORACLE";

  public get state(): AssetPriceFeedState {
    return {
      ...this.contractData,
      contractType: this.priceFeedType,
      stalenessPeriod: this.stalenessPeriod,
      skipCheck: true,
      pricefeeds: [this.underlyingPricefeeds[0].state],
    };
  }

  public static attach(args: PriceFeedAttachArgs): WstETHPriceFeedContract {
    const contract = new WstETHPriceFeedContract({
      ...args,
      lpContract: ADDRESS_0X0, // will be loaded further
    });

    contract.attach();

    return contract;
  }

  protected constructor(args: LPPriceFeedConstructorArgs) {
    super({ ...args, name: `WstETHPriceFeed`, abi: wstEthPriceFeedAbi });
  }

  public async getValue(): Promise<bigint> {
    return await this.v3.publicClient.readContract({
      abi: iwstEthAbi,
      address: this.lpContract,
      functionName: "stEthPerToken",
    });
  }
}
