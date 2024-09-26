import { ADDRESS_0X0 } from "@gearbox-protocol/sdk-gov";

import { iMellowVaultAbi, mellowLrtPriceFeedAbi } from "../../oracles";
import type { AssetPriceFeedState } from "../state/priceFactoryState";
import type { LPPriceFeedConstructorArgs } from "./AbstractLPPriceFeed";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";
import type { PriceFeedAttachArgs } from "./AbstractPriceFeed";

type abi = typeof mellowLrtPriceFeedAbi;
export class MellowLRTPriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  readonly priceFeedType = "PF_MELLOW_LRT_ORACLE";

  public get state(): AssetPriceFeedState {
    return {
      ...this.contractData,
      contractType: this.priceFeedType,
      stalenessPeriod: this.stalenessPeriod,
      skipCheck: true,
      pricefeeds: [this.underlyingPricefeeds[0].state],
    };
  }

  public static attach(args: PriceFeedAttachArgs): MellowLRTPriceFeedContract {
    const contract = new MellowLRTPriceFeedContract({
      ...args,
      lpContract: ADDRESS_0X0, // will be loaded further
    });

    contract.attach();

    return contract;
  }

  protected constructor(args: LPPriceFeedConstructorArgs) {
    super({ ...args, name: `MellowLRTPriceFeed`, abi: mellowLrtPriceFeedAbi });
  }

  public async getValue(): Promise<bigint> {
    const stack = await this.v3.publicClient.readContract({
      abi: iMellowVaultAbi,
      address: this.lpContract,
      functionName: "calculateStack",
    });

    return (stack.totalValue * BigInt(1e18)) / stack.totalSupply;
  }
}
