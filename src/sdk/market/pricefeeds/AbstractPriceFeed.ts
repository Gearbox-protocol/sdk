import type { Abi, RequiredBy, UnionOmit } from "viem";

import { ilpPriceFeedAbi } from "../../abi/index.js";
import type { PriceFeedTreeNode } from "../../base/index.js";
import { BaseContract } from "../../base/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { PriceFeedStateHuman } from "../../types/index.js";
import { PriceFeedRef } from "./PriceFeedRef.js";
import type { IPriceFeedContract, PriceFeedContractType } from "./types.js";

export type PartialPriceFeedTreeNode = RequiredBy<
  Partial<PriceFeedTreeNode>,
  "baseParams"
>;

export type PriceFeedConstructorArgs<abi extends Abi | readonly unknown[]> =
  PartialPriceFeedTreeNode & {
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
  #updatable?: boolean;
  #decimals?: number;
  #underlyingPriceFeeds?: readonly PriceFeedRef[];
  #skipCheck?: boolean;

  public hasLowerBoundCap = false;
  public readonly description?: string;

  constructor(sdk: GearboxSDK, args: PriceFeedConstructorArgs<abi>) {
    super(sdk, {
      abi: args.abi,
      addr: args.baseParams.addr,
      name: args.name + (args.description ? ` ${args.description}` : ""),
      contractType: args.baseParams.contractType,
      version: args.baseParams.version,
    });
    this.description = args.description;
    this.#decimals = args.decimals;
    this.#updatable = args.updatable;
    this.#skipCheck = args.skipCheck;

    if (args.underlyingFeeds && args.underlyingStalenessPeriods) {
      this.#underlyingPriceFeeds = args.underlyingFeeds.map(
        (address, i) =>
          new PriceFeedRef(
            this.sdk,
            address,
            args.underlyingStalenessPeriods![i],
          ),
      );
    }
  }

  public get loaded(): boolean {
    return this.#decimals !== undefined;
  }

  public get decimals(): number {
    if (this.#decimals === undefined) {
      throw new Error("price feed has been initialized with BaseParams only");
    }
    return this.#decimals;
  }

  public get updatable(): boolean {
    if (this.#updatable === undefined) {
      throw new Error("price feed has been initialized with BaseParams only");
    }
    return this.#updatable;
  }

  public get skipCheck(): boolean {
    if (this.#skipCheck === undefined) {
      throw new Error("price feed has been initialized with BaseParams only");
    }
    return this.#skipCheck;
  }

  public get underlyingPriceFeeds(): readonly PriceFeedRef[] {
    if (!this.#underlyingPriceFeeds) {
      throw new Error("price feed has been initialized with BaseParams only");
    }
    return this.#underlyingPriceFeeds;
  }

  public get priceFeedType(): PriceFeedContractType {
    return this.contractType as PriceFeedContractType;
  }

  public override stateHuman(
    raw = true,
  ): UnionOmit<PriceFeedStateHuman, "stalenessPeriod"> {
    return {
      ...super.stateHuman(raw),
      description: this.description,
      contractType: this.priceFeedType,
      skipCheck: this.skipCheck,
      pricefeeds: this.underlyingPriceFeeds.map(f => f.stateHuman(raw)),
    };
  }

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
