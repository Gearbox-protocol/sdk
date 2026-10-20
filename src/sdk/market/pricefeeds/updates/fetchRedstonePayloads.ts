import type { ILogger } from "../../../types/logger.js";
import type {
  TimestampedCalldata,
  TimestampedCalldataWithPrice,
} from "./types.js";

export interface FetchRedstonePayloadsOptions {
  /**
   * Redstone data service id
   * Most likely "redstone-primary-prod"
   */
  dataServiceId: string;
  /**
   * Feeds to fetch
   */
  dataFeedsIds: Iterable<string>;
  /**
   * Ensure minimum number of signers for each feed
   */
  uniqueSignersCount: number;

  /**
   * Historical timestamp in milliseconds
   * Must be rounded to the nearest minute
   */
  historicalTimestampMs?: number;
  /**
   * Metadata timestamp in milliseconds, if undefined, will be set to historical timestamp
   * Can be used to set deterministic metadata timestamp, so requests sent by two services at the same block are identical
   */
  metadataTimestampMs?: number;
  /**
   * Redstone gateways (put caching proxies here to avoid rate limiting)
   */
  gateways?: string[];
  /**
   * Enable redstone internal logging
   */
  enableLogging?: boolean;
  /**
   * When true, will not throw an error if redstone is unable to fetch data for some feeds
   */
  ignoreMissingFeeds?: boolean;
  /**
   * Logger to use
   */
  logger?: ILogger;
  /**
   * When true, returns the price data for each feed.
   */
  returnPrices?: boolean;
}

/** @deprecated RedStone payload fetching is no longer supported. */
export async function fetchRedstonePayloads(
  options: FetchRedstonePayloadsOptions & { returnPrices: true },
): Promise<TimestampedCalldataWithPrice[]>;
/** @deprecated RedStone payload fetching is no longer supported. */
export async function fetchRedstonePayloads(
  options: FetchRedstonePayloadsOptions & { returnPrices?: false },
): Promise<TimestampedCalldata[]>;
export async function fetchRedstonePayloads(
  options: FetchRedstonePayloadsOptions,
): Promise<TimestampedCalldata[] | TimestampedCalldataWithPrice[]> {
  for (const _feed of options.dataFeedsIds) {
    throw new Error(
      "RedStone price updates are no longer supported by this SDK",
    );
  }
  return [];
}
