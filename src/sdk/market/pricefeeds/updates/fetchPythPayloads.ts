import type { ILogger } from "../../../types/logger.js";
import type {
  TimestampedCalldata,
  TimestampedCalldataWithPrice,
} from "./types.js";

export interface FetchPythPayloadsOptions {
  /**
   * Feeds to fetch
   */
  dataFeedsIds: Iterable<string>;
  /**
   * When true, will throw an error if pyth is unable to fetch data for some feeds
   */
  failOnMissingFeeds?: boolean;
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
  /**
   * Custom fetch function to use instead of global fetch.
   * Can be used to add custom headers, authentication, or use a different HTTP client.
   */
  customFetch?: typeof fetch;

  /**
   * When true, returns the price data for each feed.
   */
  returnPrices?: boolean;
}

/** @deprecated Pyth payload fetching is no longer supported. */
export async function fetchPythPayloads(
  options: FetchPythPayloadsOptions & { returnPrices: true },
): Promise<TimestampedCalldataWithPrice[]>;

/** @deprecated Pyth payload fetching is no longer supported. */
export async function fetchPythPayloads(
  options: FetchPythPayloadsOptions & { returnPrices?: false },
): Promise<TimestampedCalldata[]>;

/** @deprecated Pyth payload fetching is no longer supported. */
export async function fetchPythPayloads(
  options: FetchPythPayloadsOptions,
): Promise<TimestampedCalldata[] | TimestampedCalldataWithPrice[]> {
  for (const _feed of options.dataFeedsIds) {
    throw new Error("Pyth price updates are no longer supported by this SDK");
  }
  return [];
}
