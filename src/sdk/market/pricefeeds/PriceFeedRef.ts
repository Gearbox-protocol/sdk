import type { Address } from "viem";

import { SDKConstruct } from "../../base/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { PriceFeedStateHuman } from "../../types/index.js";
import { formatDuration } from "../../utils/index.js";
import type { IPriceFeedContract } from "./types.js";

export class PriceFeedRef extends SDKConstruct {
  public readonly address: Address;
  public readonly stalenessPeriod: number;

  #priceFeed?: IPriceFeedContract;

  constructor(sdk: GearboxSDK, address: Address, stalenessPeriod: number) {
    super(sdk);
    this.address = address;
    this.stalenessPeriod = stalenessPeriod;
  }

  public get priceFeed(): IPriceFeedContract {
    if (!this.#priceFeed) {
      this.#priceFeed = this.sdk.priceFeeds.mustGet(this.address);
    }
    return this.#priceFeed;
  }

  public stateHuman(raw = true): PriceFeedStateHuman {
    return {
      ...this.priceFeed.stateHuman(raw),
      stalenessPeriod: formatDuration(this.stalenessPeriod),
    };
  }
}
