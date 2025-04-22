import { getAbiItem, getAddress } from "viem";

import { iPriceOracleV300Abi } from "../../abi/v300.js";
import { SDKConstruct } from "../base/index.js";
import { ADDRESS_PROVIDER_BLOCK } from "../constants/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import { PriceFeedRef } from "../market/index.js";
import type { ILogger } from "../types/logger.js";
import { formatDuration, hexEq } from "../utils/index.js";
import { getLogsSafe } from "../utils/viem/index.js";
import type { IGearboxSDKPlugin } from "./types.js";

/**
 * PriceFeedCompressor returns 0 as staleness period for reserve price feeds
 * This is because v3.0 oracle contract cannot return staleness period for reserve price feeds
 * This plugin is a workaround to load staleness periods using oracle events
 */
export class V300StalenessPeriodPlugin
  extends SDKConstruct
  implements IGearboxSDKPlugin
{
  #syncedTo: bigint;
  #logger?: ILogger;

  constructor(sdk: GearboxSDK) {
    super(sdk);
    this.#syncedTo = ADDRESS_PROVIDER_BLOCK[sdk.provider.networkType] - 1n;
    this.#logger =
      sdk.logger?.child?.({ name: "V300StalenessPeriodPlugin" }) ?? sdk.logger;
  }

  public async attach(): Promise<void> {
    await this.#syncReservePriceFeeds();
  }

  public async syncState(): Promise<void> {
    await this.#syncReservePriceFeeds();
  }

  async #syncReservePriceFeeds(): Promise<void> {
    const markets = this.sdk.marketRegister.markets;
    const oracles = markets
      .filter(m => m.priceOracle.version === 300)
      .map(m => m.priceOracle);
    const addresses = Array.from(new Set(oracles.map(o => o.address)));
    const [fromBlock, toBlock] = [this.#syncedTo + 1n, this.sdk.currentBlock];
    if (addresses.length === 0 || fromBlock > toBlock) {
      return;
    }
    const events = await getLogsSafe(this.client, {
      address: addresses,
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
      `loaded ${events.length} SetReservePriceFeed events in range [${fromBlock}; ${toBlock}]`,
    );

    for (const e of events) {
      const oracle = getAddress(e.address);
      const priceFeed = getAddress(e.args.priceFeed);
      const token = getAddress(e.args.token);
      const stalenessPeriod = e.args.stalenessPeriod;

      for (const o of oracles) {
        const map =
          e.eventName === "SetReservePriceFeed"
            ? o.reservePriceFeeds
            : o.mainPriceFeeds;
        const pf = map.get(token);
        if (hexEq(pf?.address, priceFeed) && hexEq(o.address, oracle)) {
          map.upsert(
            token,
            new PriceFeedRef(this.sdk, priceFeed, stalenessPeriod),
          );
          this.#logger?.info(
            `updated staleness period for ${this.labelAddress(token)}/${this.labelAddress(priceFeed)} in oracle ${this.labelAddress(oracle)} to ${formatDuration(stalenessPeriod)}`,
          );
        }
      }
    }

    this.#syncedTo = toBlock;
  }
}
