import type { Address } from "viem";
import { getAbiItem, getAddress } from "viem";

import { iPriceOracleV300Abi } from "../../abi/v300.js";
import { SDKConstruct } from "../base/index.js";
import { ADDRESS_PROVIDER_BLOCK, isV300 } from "../constants/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { IPriceOracleContract } from "../market/index.js";
import { PriceFeedRef } from "../market/index.js";
import type { ILogger } from "../types/logger.js";
import { AddressMap, formatDuration, hexEq } from "../utils/index.js";
import { getLogsSafe } from "../utils/viem/index.js";
import type { IGearboxSDKPlugin, IPluginState } from "./types.js";

export interface StalenessEvent {
  oracle: Address;
  priceFeed: Address;
  token: Address;
  stalenessPeriod: number;
  reserve: boolean;
}

export interface V300StalenessPeriodPluginState extends IPluginState {
  events: StalenessEvent[];
}

/**
 * PriceFeedCompressor returns 0 as staleness period for price feeds in v3.0
 * This is because v3.0 oracle contract cannot return staleness period for reserve price feeds.
 * But compressor returns 0 both for main and reserve price feeds.
 * This plugin is a workaround to load staleness periods using oracle events
 */
export class V300StalenessPeriodPlugin
  extends SDKConstruct
  implements IGearboxSDKPlugin<V300StalenessPeriodPluginState>
{
  #syncedTo: bigint;
  #logger?: ILogger;
  #events: StalenessEvent[] = [];

  public readonly version = 1;

  constructor(sdk: GearboxSDK) {
    super(sdk);
    this.#syncedTo = ADDRESS_PROVIDER_BLOCK[sdk.provider.networkType] - 1n;
    this.#logger =
      sdk.logger?.child?.({ name: "V300StalenessPeriodPlugin" }) ?? sdk.logger;
  }

  public async attach(): Promise<void> {
    await this.#syncPriceFeeds();
  }

  public async syncState(): Promise<void> {
    await this.#syncPriceFeeds();
  }

  async #syncPriceFeeds(): Promise<void> {
    const oracles = this.#getOraclesMap();
    const [fromBlock, toBlock] = [this.#syncedTo + 1n, this.sdk.currentBlock];
    if (oracles.size === 0 || fromBlock > toBlock) {
      return;
    }
    const events = await getLogsSafe(this.client, {
      address: oracles.keys(),
      events: [
        getAbiItem({
          abi: iPriceOracleV300Abi,
          name: "SetReservePriceFeed",
        }),
        getAbiItem({
          abi: iPriceOracleV300Abi,
          name: "SetPriceFeed",
        }),
      ],
      fromBlock,
      toBlock,
      strict: true,
    });
    this.#logger?.info(
      `loaded ${events.length} price feed events in range [${fromBlock}; ${toBlock}]`,
    );

    for (const e of events) {
      const oracle = oracles.mustGet(e.address);
      const priceFeed = getAddress(e.args.priceFeed);
      const token = getAddress(e.args.token);
      const stalenessPeriod = e.args.stalenessPeriod;
      const reserve = e.eventName === "SetReservePriceFeed";

      const map = reserve ? oracle.reservePriceFeeds : oracle.mainPriceFeeds;
      const pf = map.get(token);
      if (hexEq(pf?.address, priceFeed)) {
        map.upsert(
          token,
          new PriceFeedRef(this.sdk, priceFeed, stalenessPeriod),
        );
        this.#events.push({
          oracle: oracle.address,
          priceFeed,
          token,
          stalenessPeriod,
          reserve,
        });
        this.#logger?.info(
          `updated staleness period for ${this.labelAddress(token)}/${this.labelAddress(priceFeed)} in oracle ${oracle.name} to ${formatDuration(stalenessPeriod)}`,
        );
      }
    }

    this.#syncedTo = toBlock;
  }

  public get state(): V300StalenessPeriodPluginState {
    return {
      version: this.version,
      events: this.#events,
    };
  }

  public hydrate(state: V300StalenessPeriodPluginState): void {
    this.#events = state.events;
    const oracles = this.#getOraclesMap();
    for (const e of this.#events) {
      const oracle = oracles.mustGet(e.oracle);
      const map = e.reserve ? oracle.reservePriceFeeds : oracle.mainPriceFeeds;
      map.upsert(
        e.token,
        new PriceFeedRef(this.sdk, e.priceFeed, e.stalenessPeriod),
      );
      this.#logger?.info(
        `hydrated staleness period for ${this.labelAddress(e.token)}/${this.labelAddress(e.priceFeed)} in oracle ${oracle.name} to ${formatDuration(e.stalenessPeriod)}`,
      );
    }
    this.#syncedTo = this.sdk.currentBlock;
  }

  #getOraclesMap(): AddressMap<IPriceOracleContract> {
    return new AddressMap(
      this.sdk.marketRegister.markets
        .filter(m => isV300(m.priceOracle.version))
        .map(m => [m.priceOracle.address, m.priceOracle]),
    );
  }
}
