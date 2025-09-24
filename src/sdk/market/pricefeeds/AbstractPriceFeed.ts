import type { Abi, RequiredBy, UnionOmit } from "viem";

import type { PriceFeedAnswer, PriceFeedTreeNode } from "../../base/index.js";
import { BaseContract } from "../../base/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { PriceFeedStateHuman } from "../../types/index.js";
import { isUpdatablePriceFeed } from "./isUpdatablePriceFeed.js";
import { PriceFeedRef } from "./PriceFeedRef.js";
import type {
  IPriceFeedContract,
  IUpdatablePriceFeedContract,
  PriceFeedContractType,
} from "./types.js";

export type PartialPriceFeedTreeNode = RequiredBy<
  Partial<PriceFeedTreeNode>,
  "baseParams"
>;

export type PriceFeedConstructorArgs<abi extends Abi | readonly unknown[]> =
  PartialPriceFeedTreeNode & {
    abi: abi;
    name: string;
  };

export class PartialPriceFeedInitError extends Error {
  public readonly priceFeed: PriceFeedConstructorArgs<any>;

  constructor(priceFeed: PriceFeedConstructorArgs<any>) {
    super(
      `price feed ${priceFeed.baseParams.addr} has been initialized with BaseParams only`,
    );
    this.name = "ErrPartialPriceFeed";
    this.priceFeed = priceFeed;
  }
}

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
  #answer?: PriceFeedAnswer;
  #args: PriceFeedConstructorArgs<abi>;

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
    this.#args = args;
    this.description = args.description;
    this.#decimals = args.decimals;
    this.#updatable = args.updatable;
    this.#skipCheck = args.skipCheck;
    this.#answer = args.answer;

    if (args.underlyingFeeds && args.underlyingStalenessPeriods) {
      const underlyingStalenessPeriods = args.underlyingStalenessPeriods;
      this.#underlyingPriceFeeds = args.underlyingFeeds.map(
        (address, i) =>
          new PriceFeedRef(this.sdk, address, underlyingStalenessPeriods[i]),
      );
    }
  }

  public get loaded(): boolean {
    return this.#decimals !== undefined;
  }

  public get decimals(): number {
    if (this.#decimals === undefined) {
      throw new PartialPriceFeedInitError(this as any);
    }
    return this.#decimals;
  }

  public get updatable(): boolean {
    if (this.#updatable === undefined) {
      throw new PartialPriceFeedInitError(this.#args);
    }
    return this.#updatable;
  }

  public get skipCheck(): boolean {
    if (this.#skipCheck === undefined) {
      throw new PartialPriceFeedInitError(this.#args);
    }
    return this.#skipCheck;
  }

  public get underlyingPriceFeeds(): readonly PriceFeedRef[] {
    if (!this.#underlyingPriceFeeds) {
      throw new PartialPriceFeedInitError(this.#args);
    }
    return this.#underlyingPriceFeeds;
  }

  public get answer(): PriceFeedAnswer {
    if (this.#answer === undefined) {
      throw new PartialPriceFeedInitError(this.#args);
    }
    return this.#answer;
  }

  public updateAnswer(answer: PriceFeedAnswer): void {
    if (this.#answer === undefined) {
      throw new PartialPriceFeedInitError(this.#args);
    }
    this.#answer = answer;
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

  public updatableDependencies(): IUpdatablePriceFeedContract[] {
    const underlying = this.underlyingPriceFeeds.flatMap(f =>
      f.priceFeed.updatableDependencies(),
    );
    return isUpdatablePriceFeed(this) ? [this, ...underlying] : underlying;
  }
}
