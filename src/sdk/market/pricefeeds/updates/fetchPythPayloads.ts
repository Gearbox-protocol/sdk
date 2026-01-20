import { Buffer } from "buffer";
import { encodeAbiParameters, type Hex, toHex } from "viem";
import type { ILogger } from "../../../types/logger.js";
import { retry } from "../../../utils/index.js";
import {
  parseAccumulatorUpdateData,
  parsePriceFeedMessage,
  sliceAccumulatorUpdateData,
} from "./PythAccumulatorUpdateData.js";
import type { TimestampedCalldata } from "./types.js";

export interface FetchPythPayloadsOptions {
  /**
   * Feeds to fetch
   */
  dataFeedsIds: Iterable<string>;
  /**
   * When true, will not throw an error if pyth is unable to fetch data for some feeds
   */
  ignoreMissingFeeds?: boolean;
  /**
   * Historical timestamp in seconds
   */
  historicalTimestampSeconds?: number;
  /**
   * Override Hermes API with this proxy. Can be used to set caching proxies, to avoid rate limiting
   */
  apiProxy?: string;
  /**
   * Logger to use
   */
  logger?: ILogger;
}

/**
 * Fetches pyth payloads from Hermes API
 * @param dataFeedsIds
 * @returns
 */
export async function fetchPythPayloads(
  options: FetchPythPayloadsOptions,
): Promise<TimestampedCalldata[]> {
  const {
    dataFeedsIds,
    ignoreMissingFeeds,
    historicalTimestampSeconds,
    logger,
    apiProxy,
  } = options;
  const ids = Array.from(new Set(dataFeedsIds));
  if (ids.length === 0) {
    return [];
  }
  let api = apiProxy ?? "https://hermes.pyth.network/v2/updates/price/";
  api = api.endsWith("/") ? api : `${api}/`;
  // https://hermes.pyth.network/docs/#/rest/latest_price_updates
  const url = new URL(api + (historicalTimestampSeconds ?? "latest"));
  // we're requesting non-parsed data for multiple feeds, and then splitting it manually
  url.searchParams.append("parsed", "false");
  if (ignoreMissingFeeds) {
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

  if (result.length !== ids.length) {
    if (ignoreMissingFeeds) {
      logger?.warn(`expected ${ids.length} price feeds, got ${result.length}`);
    } else {
      throw new Error(
        `expected ${ids.length} price feeds, got ${result.length}`,
      );
    }
  }

  return result;
}

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

interface PythPriceFeedUpdate {
  dataFeedId: Hex;
  timestamp: number;
  data: Hex;
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
