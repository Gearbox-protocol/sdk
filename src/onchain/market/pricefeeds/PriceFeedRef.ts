import type { Address } from "viem";

import { Construct, type ConstructOptions } from "../../base/index.js";
import type { PriceFeedStateHuman } from "../../types/index.js";
import { formatDuration } from "../../utils/index.js";
import type { IPriceFeedContract } from "./types.js";

/**
 * Connector between a price oracle and a price feed contract.
 *
 * Each token tracked by a {@link IPriceOracleContract} has an associated
 * `PriceFeedRef` that pairs the feed's on-chain address with the
 * staleness period the oracle uses when evaluating the feed's answer.
 **/
export class PriceFeedRef extends Construct {
  /**
   * On-chain address of the referenced price feed contract.
   **/
  public readonly address: Address;
  /**
   * Maximum allowed age (in seconds) of the feed's answer before the
   * oracle considers it stale.
   **/
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

  /**
   * Lazily resolved price feed contract instance.
   * @throws If the feed is not registered in the contracts register.
   **/
  public get priceFeed(): IPriceFeedContract {
    if (!this.#priceFeed) {
      this.#priceFeed = this.register.mustGetContract<IPriceFeedContract>(
        this.address,
      );
    }
    return this.#priceFeed;
  }

  /**
   * Returns a human-readable snapshot of the feed state, including the
   * staleness period formatted as a duration string.
   * @param raw - When `true`, includes raw/unformatted values.
   **/
  public stateHuman(raw = true): PriceFeedStateHuman {
    return {
      ...this.priceFeed.stateHuman(raw),
      stalenessPeriod: formatDuration(this.stalenessPeriod),
    };
  }
}
