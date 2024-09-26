import type { Abi, Hex } from "viem";

import { ilpPriceFeedAbi } from "../../abi";
import type { BaseContractOptions, PriceFeedTreeNode } from "../../base";
import { BaseContract } from "../../base";
import type { PriceFeedState } from "../../state";
import { bytes32ToString } from "../../utils";
import type { IPriceFeedContract, PriceFeedContractType } from "./types";

export type PriceFeedConstructorArgs<abi extends Abi | readonly unknown[]> =
  BaseContractOptions<abi> &
    PriceFeedTreeNode & {
      stalenessPeriod?: number;
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
  public readonly stalenessPeriod: number;
  public readonly priceFeedType: PriceFeedContractType;
  public readonly decimals: number;
  public hasLowerBoundCap = false;

  constructor(args: PriceFeedConstructorArgs<abi>) {
    super(args);
    this.priceFeedType = bytes32ToString(
      args.baseParams.contractType as Hex,
    ) as PriceFeedContractType;
    this.address = args.address ?? args.baseParams.addr;
    this.version = Number(args.version ?? args.baseParams.version);
    this.decimals = args.decimals;

    this.stalenessPeriod = args.stalenessPeriod || 0;
    this.updatable = args.updatable || false;
  }

  public abstract get state(): PriceFeedState;

  async currentLowerBound(): Promise<bigint> {
    return await this.provider.publicClient.readContract({
      abi: ilpPriceFeedAbi,
      address: this.address,
      functionName: "lowerBound",
    });
  }

  async answer(overrides?: { blockNumber?: bigint }): Promise<bigint> {
    const lastRoundData = await this.provider.publicClient.readContract({
      abi: ilpPriceFeedAbi,
      address: this.address,
      functionName: "latestRoundData",
      ...overrides,
    });

    return lastRoundData[1];
  }

  public updatableDependencies(): IPriceFeedContract[] {
    return this.updatable ? [this] : [];
  }
}
