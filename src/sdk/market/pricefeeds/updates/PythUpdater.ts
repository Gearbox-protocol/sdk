import type { Address, Hex } from "viem";
import { z } from "zod/v4";
import { SDKConstruct } from "../../../base/index.js";
import type { GearboxSDK } from "../../../GearboxSDK.js";
import type {
  IPriceFeedContract,
  IUpdatablePriceFeedContract,
} from "../types.js";
import { fetchPythPayloads } from "./fetchPythPayloads.js";
import { PriceUpdatesCache } from "./PriceUpdatesCache.js";
import { PriceUpdateTx } from "./PriceUpdateTx.js";
import type {
  IPriceUpdater,
  IPriceUpdateTask,
  TimestampedCalldata,
} from "./types.js";

interface IPythPriceFeedContract extends IUpdatablePriceFeedContract {
  readonly token: Address;
  readonly priceFeedId: Hex;
  readonly pyth: Address;
  readonly maxConfToPriceRatio?: bigint;
}

export type PythUpdateTask = IPriceUpdateTask;

class PythUpdateTx extends PriceUpdateTx<PythUpdateTask> {
  public readonly name = "pyth";
}

export const PythOptions = z.object({
  /**
   * Fixed pyth historic timestamp in seconds
   * Set to true to enable pyth historical mode using timestamp from attach block
   */
  historicTimestamp: z
    .union([z.number().nonnegative(), z.literal(true)])
    .optional(),
  /**
   * Override Hermes API with this proxy. Can be used to set caching proxies, to avoid rate limiting
   */
  apiProxy: z.url().optional(),
  /**
   * TTL for pyth cache in milliseconds
   * If 0, disables caching
   * If not set, uses some default value
   * Cache is always enabled in historical mode
   */
  cacheTTL: z.number().nonnegative().optional(),
  /**
   * When true, no error will be thrown when pyth is unable to fetch data for some feeds
   */
  ignoreMissingFeeds: z.boolean().optional(),
});

export type PythOptions = z.infer<typeof PythOptions>;

/**
 * Class to update multiple pyth price feeds at once
 */
export class PythUpdater
  extends SDKConstruct
  implements IPriceUpdater<PythUpdateTask>
{
  #cache: PriceUpdatesCache;
  #historicalTimestamp?: number;
  #apiProxy?: string;
  #ignoreMissingFeeds?: boolean;

  constructor(sdk: GearboxSDK, opts: PythOptions = {}) {
    super(sdk);
    const { apiProxy, cacheTTL, ignoreMissingFeeds, historicTimestamp } = opts;
    this.#ignoreMissingFeeds = ignoreMissingFeeds;
    this.#apiProxy = apiProxy;

    if (historicTimestamp) {
      this.#historicalTimestamp =
        historicTimestamp === true
          ? Number(this.sdk.timestamp)
          : historicTimestamp;
      this.logger?.debug(
        `using historical timestamp ${this.#historicalTimestamp}`,
      );
    }
    this.#cache = PriceUpdatesCache.get("pyth", {
      // currently staleness period is 240 seconds on all networks, add some buffer
      // this period of 4 minutes is selected based on time that is required for user to sign transaction with wallet
      // so it's unlikely to decrease
      ttl: cacheTTL ?? 225 * 1000,
      historical: !!historicTimestamp,
    });
  }

  public async getUpdateTxs(
    feeds: IPriceFeedContract[],
  ): Promise<PythUpdateTx[]> {
    if (feeds.length === 0) {
      return [];
    }
    this.logger?.debug(
      `generating update transactions for ${feeds.length} pyth price feeds`,
    );
    const pythFeeds = new Map<string, IPythPriceFeedContract>(
      feeds.filter(isPyth).map(f => [f.priceFeedId, f]),
    );

    const payloads = await this.#getPayloads(new Set(pythFeeds.keys()));

    let [minTimestamp, maxTimestamp] = [Number.POSITIVE_INFINITY, 0];
    const results: PythUpdateTx[] = [];

    for (const p of payloads) {
      const priceFeed = pythFeeds.get(p.dataFeedId);
      if (!priceFeed) {
        throw new Error(`cannot find price feed for ${p.dataFeedId}`);
      }
      const { dataFeedId, timestamp, cached, data } = p;
      minTimestamp = Math.min(minTimestamp, timestamp);
      maxTimestamp = Math.max(maxTimestamp, timestamp);
      results.push(
        new PythUpdateTx(priceFeed.createPriceUpdateTx(data), {
          dataFeedId,
          priceFeed: priceFeed.address,
          timestamp,
          cached,
        }),
      );
    }
    let tsRange = "";
    if (results.length) {
      const minDelta = BigInt(minTimestamp) - this.sdk.timestamp;
      tsRange = `, timestamps ${minTimestamp} (${minDelta})`;
      if (minTimestamp !== maxTimestamp) {
        const maxDelta = BigInt(maxTimestamp) - this.sdk.timestamp;
        tsRange = `${tsRange} - ${maxTimestamp} (${maxDelta})`;
      }
    }
    this.logger?.debug(
      `generated ${results.length} update transactions for pyth price feeds: ${Array.from(pythFeeds.keys()).join(", ")}${tsRange}`,
    );
    return results;
  }

  /**
   * Gets pyth payloads
   * @param dataFeedsIds
   * @returns
   */
  async #getPayloads(
    dataFeedsIds: Set<string>,
  ): Promise<TimestampedCalldata[]> {
    this.logger?.debug(
      `getting pyth payloads for ${dataFeedsIds.size} price feeds: ${Array.from(dataFeedsIds).join(", ")}`,
    );
    const fromCache: TimestampedCalldata[] = [];
    const uncached: string[] = [];
    for (const priceFeedsId of dataFeedsIds) {
      const cached = this.#cache.get(priceFeedsId);
      if (cached) {
        fromCache.push({ ...cached, cached: true });
      } else {
        uncached.push(priceFeedsId);
      }
    }

    const fromPyth: TimestampedCalldata[] = await this.#fetchPayloads(
      new Set(uncached),
    );
    // cache newly fetched responses
    for (const resp of fromPyth) {
      this.#cache.set(resp, resp.dataFeedId);
    }
    this.logger?.debug(
      `got ${fromPyth.length} new pyth updates and ${fromCache.length} from cache`,
    );

    return [...fromCache, ...fromPyth];
  }

  /**
   * Fetches pyth payloads from Hermes API
   * @param dataFeedsIds
   * @returns
   */
  async #fetchPayloads(
    dataFeedsIds: Set<string>,
  ): Promise<TimestampedCalldata[]> {
    if (dataFeedsIds.size === 0) {
      return [];
    }
    const ids = Array.from(dataFeedsIds);
    const tsStr = this.#historicalTimestamp
      ? ` with historical timestamp ${this.#historicalTimestamp}`
      : "";
    this.logger?.debug(
      `fetching pyth payloads for ${dataFeedsIds.size} price feeds: ${ids.join(", ")}${tsStr}`,
    );
    return fetchPythPayloads({
      dataFeedsIds,
      historicalTimestampSeconds: this.#historicalTimestamp,
      apiProxy: this.#apiProxy,
      ignoreMissingFeeds: this.#ignoreMissingFeeds,
      logger: this.logger,
    });
  }
}

function isPyth(pf: IPriceFeedContract): pf is IPythPriceFeedContract {
  return pf.contractType === "PRICE_FEED::PYTH";
}
