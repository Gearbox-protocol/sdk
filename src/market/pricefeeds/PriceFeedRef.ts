import type { Address } from "viem";

import type { GearboxSDK } from "../../GearboxSDK";
import type { PriceFeedState } from "../../state";
import type { IPriceFeedContract } from "./types";

export class PriceFeedRef {
  public readonly address: Address;
  public readonly stalenessPeriod: number;

  readonly #sdk: GearboxSDK;
  #priceFeed?: IPriceFeedContract;

  constructor(sdk: GearboxSDK, address: Address, stalenessPeriod: number) {
    this.address = address;
    this.stalenessPeriod = stalenessPeriod;
    this.#sdk = sdk;
  }

  public get priceFeed(): IPriceFeedContract {
    if (!this.#priceFeed) {
      this.#priceFeed = this.#sdk.priceFeeds.mustGet(this.address);
    }
    return this.#priceFeed;
  }

  public get state(): PriceFeedState {
    return {
      ...(this.priceFeed.state as PriceFeedState),
      stalenessPeriod: this.stalenessPeriod,
    };
  }
}
