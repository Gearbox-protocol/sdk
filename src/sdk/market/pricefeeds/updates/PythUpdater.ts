import { Buffer } from "buffer";
import type { Address, Hex } from "viem";
import { encodeAbiParameters, toHex } from "viem";
import { z } from "zod/v4";
import { SDKConstruct } from "../../../base/index.js";
import type { GearboxSDK } from "../../../GearboxSDK.js";
import type { ILogger } from "../../../types/index.js";
import { childLogger, retry } from "../../../utils/index.js";
import type {
  IPriceFeedContract,
  IUpdatablePriceFeedContract,
} from "../types.js";
import { PriceUpdatesCache } from "./PriceUpdatesCache.js";
import { PriceUpdateTx } from "./PriceUpdateTx.js";
import {
  parseAccumulatorUpdateData,
  parsePriceFeedMessage,
  sliceAccumulatorUpdateData,
} from "./PythAccumulatorUpdateData.js";
import type {
  IPriceUpdater,
  IPriceUpdateTask,
  TimestampedCalldata,
} from "./types.js";

interface PythPriceUpdatesResp {
  binary: {
    encoding: "hex";
    data: string[];
  };
  parsed: PythPriceFeed[];
}

interface PythPriceFeed {
  id: string;
  price: PythPrice;
  ema_price: PythPrice;
  metadata: PythMetadata;
}

interface PythPrice {
  price: string;
  conf: string;
  expo: number;
  publish_time: number;
}

interface PythMetadata {
  slot: number;
  proof_available_time: number;
  prev_publish_time: number;
}

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
  #logger?: ILogger;
  #cache: PriceUpdatesCache;
  #historicalTimestamp?: number;
  #api: string;
  #ignoreMissingFeeds?: boolean;

  constructor(sdk: GearboxSDK, opts: PythOptions = {}) {
    super(sdk);
    this.#logger = childLogger("PythUpdater", sdk.logger);
    this.#ignoreMissingFeeds = opts.ignoreMissingFeeds;
    this.#api =
      opts.apiProxy ?? "https://hermes.pyth.network/v2/updates/price/";
    this.#api = this.#api.endsWith("/") ? this.#api : `${this.#api}/`;

    const ts = opts.historicTimestamp;
    if (ts) {
      this.#historicalTimestamp = ts === true ? Number(this.sdk.timestamp) : ts;
      this.#logger?.debug(
        `using historical timestamp ${this.#historicalTimestamp}`,
      );
    }
    this.#cache = new PriceUpdatesCache({
      // currently staleness period is 240 seconds on all networks, add some buffer
      // this period of 4 minutes is selected based on time that is required for user to sign transaction with wallet
      // so it's unlikely to decrease
      ttl: opts.cacheTTL ?? 225 * 1000,
      historical: !!ts,
    });
  }

  public async getUpdateTxs(
    feeds: IPriceFeedContract[],
  ): Promise<PythUpdateTx[]> {
    this.#logger?.debug(
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
    this.#logger?.debug(
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
    this.#logger?.debug(
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
    this.#logger?.debug(
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
    this.#logger?.debug(
      `fetching pyth payloads for ${dataFeedsIds.size} price feeds: ${ids.join(", ")}${tsStr}`,
    );
    // https://hermes.pyth.network/docs/#/rest/latest_price_updates
    const url = new URL(this.#api + (this.#historicalTimestamp ?? "latest"));
    // we're requesting non-parsed data for multiple feeds, and then splitting it manually
    url.searchParams.append("parsed", "false");
    if (this.#ignoreMissingFeeds) {
      url.searchParams.append("ignore_invalid_price_ids", "true");
    }
    for (const id of dataFeedsIds) {
      url.searchParams.append("ids[]", id);
    }
    const resp = await retry(
      async () => {
        const resp = await fetch(url.toString());
        if (!resp.ok) {
          const body = await resp.text();
          throw new Error(
            `failed to fetch pyth payloads: ${resp.statusText}: ${body}`,
          );
        }
        const data = await resp.json();
        return data as PythPriceUpdatesResp;
      },
      { attempts: 3, exponent: 2, interval: 200 },
    );
    const result = respToCalldata(resp);
    if (!this.#ignoreMissingFeeds && result.length !== dataFeedsIds.size) {
      throw new Error(
        `expected ${dataFeedsIds.size} price feeds, got ${result.length}`,
      );
    }
    return result;
  }
}

function isPyth(pf: IPriceFeedContract): pf is IPythPriceFeedContract {
  return pf.contractType === "PRICE_FEED::PYTH";
}

function respToCalldata(resp: PythPriceUpdatesResp): TimestampedCalldata[] {
  // edge case when ignoreMissingFeeds is true and we requesting exactly one feed which fails
  if (resp.binary.data.length === 0) {
    return [];
  }

  const updates = splitAccumulatorUpdates(resp.binary.data[0]);
  return updates.map(({ data, dataFeedId, timestamp }) => {
    return {
      dataFeedId,
      data: encodeAbiParameters(
        [{ type: "uint256" }, { type: "bytes[]" }],
        [BigInt(timestamp), [data]],
      ),
      timestamp,
      cached: false,
    };
  });
}

interface PythPriceFeedUpdate {
  dataFeedId: Hex;
  timestamp: number;
  data: Hex;
}

function splitAccumulatorUpdates(binary: string): PythPriceFeedUpdate[] {
  const data = Buffer.from(binary, "hex");

  const parsed = parseAccumulatorUpdateData(data);
  const results: PythPriceFeedUpdate[] = [];

  for (let i = 0; i < parsed.updates.length; i++) {
    const upd = parsed.updates[i].message;
    const msg = parsePriceFeedMessage(upd);
    results.push({
      dataFeedId: toHex(msg.feedId),
      timestamp: msg.publishTime.toNumber(),
      data: toHex(sliceAccumulatorUpdateData(data, i, i + 1)),
    });
  }

  return results;
}
