import { ADDRESS_0X0, PriceFeedType } from "@gearbox-protocol/sdk-gov";

import { iyVaultAbi, yearnPriceFeedAbi } from "../../oracles";
import type { AssetPriceFeedState } from "../state/priceFactoryState";
import type { LPPriceFeedConstructorArgs } from "./AbstractLPPriceFeed";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";
import type { PriceFeedAttachArgs } from "./AbstractPriceFeed";

type abi = typeof yearnPriceFeedAbi;
export class YearnPriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  readonly priceFeedType = "PF_YEARN_ORACLE";

  public get state(): AssetPriceFeedState {
    return {
      ...this.contractData,
      contractType: this.priceFeedType,
      stalenessPeriod: this.stalenessPeriod,
      skipCheck: true,
      pricefeeds: [this.underlyingPricefeeds[0].state],
    };
  }

  public static attach(args: PriceFeedAttachArgs): YearnPriceFeedContract {
    const contract = new YearnPriceFeedContract({
      ...args,
      lpContract: ADDRESS_0X0, // will be loaded further
    });

    contract.attach();

    return contract;
  }

  protected constructor(args: LPPriceFeedConstructorArgs) {
    super({ ...args, name: `YearnPriceFeed`, abi: yearnPriceFeedAbi });
  }

  public async getValue(): Promise<bigint> {
    return await this.v3.publicClient.readContract({
      abi: iyVaultAbi,
      address: this.lpContract,
      functionName: "pricePerShare",
    });
  }
}
