import type { Abi } from "viem";

import { ilpPriceFeedAbi } from "../../abi";
import type { PriceFeedTreeNode } from "../../base";
import { BaseContract } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import type { PriceFeedState } from "../../state";
import { PriceFeedRef } from "./PriceFeedRef";
import type { IPriceFeedContract, PriceFeedContractType } from "./types";

export type PriceFeedConstructorArgs<abi extends Abi | readonly unknown[]> =
  PriceFeedTreeNode & {
    abi: abi;
    name: string;
  };

export abstract class AbstractPriceFeedContract<
    const abi extends Abi | readonly unknown[],
  >
  extends BaseContract<abi>
  implements IPriceFeedContract
{
  /**
   * True if the contract deployed at this address implements IUpdatablePriceFeed interface
   */
  public readonly updatable: boolean;
  public readonly decimals: number;
  public readonly underlyingPriceFeeds: PriceFeedRef[];
  public hasLowerBoundCap = false;

  constructor(sdk: GearboxSDK, args: PriceFeedConstructorArgs<abi>) {
    super(sdk, {
      abi: args.abi,
      address: args.baseParams.addr,
      name: args.name,
      contractType: args.baseParams.contractType,
      version: Number(args.baseParams.version),
    });
    this.decimals = args.decimals;
    this.updatable = args.updatable;
    this.underlyingPriceFeeds = args.underlyingFeeds.map(
      (address, i) =>
        new PriceFeedRef(this.sdk, address, args.underlyingStalenessPeriods[i]),
    );
  }

  public get priceFeedType(): PriceFeedContractType {
    return this.contractType as PriceFeedContractType;
  }

  public abstract get state(): Omit<PriceFeedState, "stalenessPeriod">;

  async currentLowerBound(): Promise<bigint> {
    return await this.sdk.provider.publicClient.readContract({
      abi: ilpPriceFeedAbi,
      address: this.address,
      functionName: "lowerBound",
    });
  }

  async answer(overrides?: { blockNumber?: bigint }): Promise<bigint> {
    const lastRoundData = await this.sdk.provider.publicClient.readContract({
      abi: ilpPriceFeedAbi,
      address: this.address,
      functionName: "latestRoundData",
      ...overrides,
    });

    return lastRoundData[1];
  }

  public updatableDependencies(): IPriceFeedContract[] {
    const underlying = this.underlyingPriceFeeds.flatMap(f =>
      f.priceFeed.updatableDependencies(),
    );
    return this.updatable ? [this, ...underlying] : underlying;
  }
}
