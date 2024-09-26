import { ADDRESS_0X0 } from "@gearbox-protocol/sdk-gov";
import { erc4626Abi } from "viem";
import { erc20Abi, erc4626PriceFeedAbi } from "../../oracles";
import {
  AbstractLPPriceFeedContract,
  LPPriceFeedConstructorArgs,
} from "./AbstractLPPriceFeed";
import { PriceFeedAttachArgs } from "./AbstractPriceFeed";
import { AssetPriceFeedState } from "../state/priceFactoryState";

export class Erc4626PriceFeedContract extends AbstractLPPriceFeedContract<
  typeof erc4626PriceFeedAbi
> {
  readonly priceFeedType = "PF_ERC4626_ORACLE";

  public get state(): AssetPriceFeedState {
    return {
      ...this.contractData,
      contractType: this.priceFeedType,
      stalenessPeriod: this.stalenessPeriod,
      skipCheck: true,
      pricefeeds: [this.underlyingPricefeeds[0].state],
    };
  }

  public static attach(args: PriceFeedAttachArgs): Erc4626PriceFeedContract {
    const contract = new Erc4626PriceFeedContract({
      ...args,
      lpContract: ADDRESS_0X0, // will be loaded further
    });

    contract.attach();

    return contract;
  }

  protected constructor(args: LPPriceFeedConstructorArgs) {
    super({ ...args, name: `ERC4626PriceFeed`, abi: erc4626PriceFeedAbi });
  }

  async getValue(): Promise<bigint> {
    const decimals = await this.v3.publicClient.readContract({
      abi: erc20Abi,
      address: this.lpContract,
      functionName: "decimals",
    });

    const price = await this.v3.publicClient.readContract({
      abi: erc4626Abi,
      address: this.lpContract,
      functionName: "convertToAssets",
      args: [10n ** BigInt(decimals)],
    });

    return price;
  }
}
