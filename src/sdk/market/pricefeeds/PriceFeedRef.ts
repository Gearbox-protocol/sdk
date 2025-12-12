import type { Address } from "viem";

import { Construct, type ConstructOptions } from "../../base/index.js";
import type { PriceFeedStateHuman } from "../../types/index.js";
import { formatDuration } from "../../utils/index.js";
import type { IPriceFeedContract } from "./types.js";

/**
 * PriceFeedRef is a connector between price feed and oracle, e.g. oracle's entry for price feed + staleness period
 */
export class PriceFeedRef extends Construct {
  public readonly address: Address;
  public readonly stalenessPeriod: number;

  #priceFeed?: IPriceFeedContract;

  constructor(
    options: ConstructOptions,
    address: Address,
    stalenessPeriod: number,
  ) {
    super(options);
    this.address = address;
    this.stalenessPeriod = stalenessPeriod;
  }

  public get priceFeed(): IPriceFeedContract {
    if (!this.#priceFeed) {
      this.#priceFeed = this.register.mustGetContract<IPriceFeedContract>(
        this.address,
      );
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
