import { ADDRESS_0X0 } from "@gearbox-protocol/sdk-gov";
import type { Abi, Address, Hex } from "viem";

import { ilpPriceFeedAbi } from "../../oracles";
import { BaseContract } from "../base/BaseContract";
import type { PriceFeedFactory } from "../market/PriceFeedFactory";
import type { PriceFeedState } from "../state/priceFactoryState";
import type {
  IPriceFeedContract,
  PriceFeedContractType,
  PriceFeedParamsStruct,
} from "./types";

export interface PriceFeedConstructorArgs {
  factory: PriceFeedFactory;
  stalenessPeriod?: number;
  address?: Address;
  version?: number;
  updatable?: boolean;
}

export interface PriceFeedAttachArgs {
  factory: PriceFeedFactory;
  address: Address;
}

interface SuperPriceFeedConstructorArgs<abi extends Abi | readonly unknown[]>
  extends PriceFeedConstructorArgs {
  name: string;
  abi: abi;
}

export abstract class AbstractPriceFeedContract<
    const abi extends Abi | readonly unknown[],
  >
  extends BaseContract<abi>
  implements IPriceFeedContract
{
  factory: PriceFeedFactory;
  updatable: boolean;
  hasLowerBoundCap = false;
  priceFeedType: PriceFeedContractType;

  stalenessPeriod: number;
  decimals: number;

  public abstract get state(): PriceFeedState;

  constructor(args: SuperPriceFeedConstructorArgs<abi>) {
    super({
      address: args.address || ADDRESS_0X0,
      chainClient: args.factory.sdk.v3,
      name: args.name,
      abi: args.abi,
    });

    this.stalenessPeriod = args.stalenessPeriod || 0;
    this.factory = args.factory;
    this.version = args.version || 0;
    this.updatable = args.updatable || false;
  }

  async currentLowerBound(): Promise<bigint> {
    return await this.v3.publicClient.readContract({
      abi: ilpPriceFeedAbi,
      address: this.address,
      functionName: "lowerBound",
    });
  }

  get params(): PriceFeedParamsStruct {
    return {
      priceFeed: this.address,
      stalenessPeriod: this.stalenessPeriod,
    };
  }

  async answer(overrides: { blockNumber?: bigint }): Promise<bigint> {
    const lastRoundData = await this.v3.publicClient.readContract({
      abi: ilpPriceFeedAbi,
      address: this.address,
      functionName: "latestRoundData",
      ...overrides,
    });

    return lastRoundData[1];
  }

  protected parseCompressorSpecificParams(data: Hex): void {}
}
