import { DataServiceWrapper } from "@redstone-finance/evm-connector";
import type { SignedDataPackage } from "@redstone-finance/protocol";
import { RedstonePayload } from "@redstone-finance/protocol";
import {
  type DataServiceIds,
  getSignersForDataServiceId,
} from "@redstone-finance/sdk";
import type { Address, Hex } from "viem";
import { encodeAbiParameters, toBytes } from "viem";
import { z } from "zod/v4";
import { SDKConstruct } from "../../../base/index.js";
import type { GearboxSDK } from "../../../GearboxSDK.js";
import type { ILogger } from "../../../types/index.js";
import { AddressMap, childLogger, retry } from "../../../utils/index.js";
import type {
  IPriceFeedContract,
  IUpdatablePriceFeedContract,
} from "../types.js";
import { PriceUpdatesCache } from "./PriceUpdatesCache.js";
import { PriceUpdateTx } from "./PriceUpdateTx.js";
import type {
  IPriceUpdater,
  IPriceUpdateTask,
  TimestampedCalldata,
} from "./types.js";

interface IRedstonePriceFeedContract extends IUpdatablePriceFeedContract {
  readonly token: Address;
  readonly dataServiceId: string;
  readonly dataId: string;
  readonly signers: Hex[];
  readonly signersThreshold: number;
  readonly lastPrice: bigint;
  readonly lastPayloadTimestamp: number;
}

interface RedstoneUpdateTask extends IPriceUpdateTask {
  dataServiceId: string;
}

class RedstoneUpdateTx extends PriceUpdateTx<RedstoneUpdateTask> {
  public readonly name = "redstone";
}

export const RedstoneOptions = z.object({
  /**
   * Fixed redstone historic timestamp in ms
   * Set to true to enable redstone historical mode using timestamp from attach block
   */
  historicTimestamp: z
    .union([z.number().nonnegative(), z.literal(true)])
    .optional(),
  /**
   * Override redstone gateways. Can be used to set caching proxies, to avoid rate limiting
   */
  gateways: z.array(z.url()).optional(),
  /**
   * TTL for redstone cache in milliseconds
   * If 0, disables caching
   * If not set, uses some default value
   * Cache is always enabled in historical mode
   */
  cacheTTL: z.number().nonnegative().optional(),
  /**
   * When true, no error will be thrown when redstone is unable to fetch data for some feeds
   */
  ignoreMissingFeeds: z.boolean().optional(),
  /**
   * Enable redstone internal logging
   */
  enableLogging: z.boolean().optional(),
});

export type RedstoneOptions = z.infer<typeof RedstoneOptions>;
/**
 * Class to update multiple redstone price feeds at once
 */
export class RedstoneUpdater
  extends SDKConstruct
  implements IPriceUpdater<RedstoneUpdateTask>
{
  #logger?: ILogger;
  #cache: PriceUpdatesCache;
  #historicalTimestampMs?: number;
  #gateways?: string[];
  #ignoreMissingFeeds?: boolean;
  #enableLogging?: boolean;

  constructor(sdk: GearboxSDK, opts: RedstoneOptions = {}) {
    super(sdk);
    this.#logger = childLogger("RedstoneUpdater", sdk.logger);
    this.#ignoreMissingFeeds = opts.ignoreMissingFeeds;
    this.#enableLogging = opts.enableLogging;
    this.#gateways = opts.gateways?.length ? opts.gateways : undefined;

    let ts = opts.historicTimestamp;
    if (ts) {
      ts = ts === true ? Number(this.sdk.timestamp) * 1000 : ts;
      this.#historicalTimestampMs = 60_000 * Math.floor(ts / 60_000);
      this.#logger?.debug(
        `using historical timestamp ${this.#historicalTimestampMs}`,
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
    logContext: Record<string, any> = {},
  ): Promise<RedstoneUpdateTx[]> {
    this.#logger?.debug(
      logContext,
      `generating update transactions for ${feeds.length} redstone price feeds`,
    );

    // Group feeds by dataServiceId and uniqueSignersCount
    const groupedFeeds: Record<string, Set<string>> = {};
    // group price feeds by data id
    const priceFeeds = new Map<
      string,
      AddressMap<IRedstonePriceFeedContract>
    >();
    for (const feed of feeds) {
      if (!isRedstone(feed)) {
        continue;
      }
      const key = `${feed.dataServiceId}:${feed.signersThreshold}`;
      if (!groupedFeeds[key]) {
        groupedFeeds[key] = new Set();
      }
      groupedFeeds[key].add(feed.dataId);
      const pfsForDataId =
        priceFeeds.get(feed.dataId) ??
        new AddressMap<IRedstonePriceFeedContract>();
      pfsForDataId.upsert(feed.address, feed);
      priceFeeds.set(feed.dataId, pfsForDataId);
    }

    const results: RedstoneUpdateTx[] = [];
    let [minTimestamp, maxTimestamp] = [Number.POSITIVE_INFINITY, 0];
    for (const [key, group] of Object.entries(groupedFeeds)) {
      const [dataServiceId, signersStr] = key.split(":");
      const uniqueSignersCount = parseInt(signersStr, 10);
      const payloads = await this.#getPayloads(
        dataServiceId,
        group,
        uniqueSignersCount,
      );

      for (const { dataFeedId, data, timestamp, cached } of payloads) {
        const pfsForDataId = priceFeeds.get(dataFeedId);
        if (!pfsForDataId) {
          throw new Error(`cannot get price feed addresses for ${dataFeedId}`);
        }
        for (const priceFeed of pfsForDataId.values()) {
          minTimestamp = Math.min(minTimestamp, timestamp);
          maxTimestamp = Math.max(maxTimestamp, timestamp);
          results.push(
            new RedstoneUpdateTx(priceFeed.createPriceUpdateTx(data), {
              dataFeedId,
              dataServiceId,
              priceFeed: priceFeed.address,
              timestamp,
              cached,
            }),
          );
        }
      }
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
      logContext,
      `generated ${results.length} update transactions for redstone price feeds: ${Array.from(priceFeeds.keys()).join(", ")}${tsRange}`,
    );
    return results;
  }

  /**
   * Gets redstone payloads in one request for multiple feeds with the same dataServiceId and uniqueSignersCount
   * If historicalTimestamp is set, responses will be cached
   * @param dataServiceId
   * @param dataFeedsIds
   * @param uniqueSignersCount
   * @returns
   */
  async #getPayloads(
    dataServiceId: string,
    dataFeedsIds: Set<string>,
    uniqueSignersCount: number,
  ): Promise<TimestampedCalldata[]> {
    this.#logger?.debug(
      `getting redstone payloads for ${dataFeedsIds.size} data feeds in ${dataServiceId} with ${uniqueSignersCount} signers: ${Array.from(dataFeedsIds).join(", ")}`,
    );
    const fromCache: TimestampedCalldata[] = [];
    const uncached: string[] = [];
    for (const dataFeedId of dataFeedsIds) {
      const cached = this.#cache.get(
        dataServiceId,
        dataFeedId,
        uniqueSignersCount,
      );
      if (cached) {
        fromCache.push({ ...cached, cached: true });
      } else {
        uncached.push(dataFeedId);
      }
    }

    const fromRedstone: TimestampedCalldata[] = await this.#fetchPayloads(
      dataServiceId,
      new Set(uncached),
      uniqueSignersCount,
    );
    // cache newly fetched responses
    for (const resp of fromRedstone) {
      this.#cache.set(resp, dataServiceId, resp.dataFeedId, uniqueSignersCount);
    }
    this.#logger?.debug(
      `got ${fromRedstone.length} new redstone updates and ${fromCache.length} from cache`,
    );

    return [...fromCache, ...fromRedstone];
  }

  /**
   * Fetches redstone payloads in one request for multiple feeds with the same dataServiceId and uniqueSignersCount
   * Payloads are loaded in one request to avoid redstone rate limit
   * @param dataServiceId
   * @param dataFeedsIds
   * @param uniqueSignersCount
   * @returns
   */
  async #fetchPayloads(
    dataServiceId: string,
    dataFeedsIds: Set<string>,
    uniqueSignersCount: number,
  ): Promise<TimestampedCalldata[]> {
    if (dataFeedsIds.size === 0) {
      return [];
    }
    const dataPackagesIds = Array.from(dataFeedsIds);
    const tsStr = this.#historicalTimestampMs
      ? ` with historical timestamp ${this.#historicalTimestampMs}`
      : "";
    this.#logger?.debug(
      `fetching redstone payloads for ${dataFeedsIds.size} data feeds in ${dataServiceId} with ${uniqueSignersCount} signers: ${dataPackagesIds.join(", ")}${tsStr}`,
    );
    const wrapper = new DataServiceWrapper({
      dataServiceId,
      dataPackagesIds,
      uniqueSignersCount,
      authorizedSigners: getSignersForDataServiceId(
        dataServiceId as DataServiceIds,
      ),
      historicalTimestamp: this.#historicalTimestampMs,
      urls: this.#gateways,
      ignoreMissingFeed: this.#ignoreMissingFeeds,
      enableEnhancedLogs: this.#enableLogging,
    });

    const dataPayload = await retry(
      () => wrapper.prepareRedstonePayload(true),
      { attempts: 5, interval: this.#historicalTimestampMs ? 30_500 : 250 },
    );

    const parsed = RedstonePayload.parse(toBytes(`0x${dataPayload}`));
    const packagesByDataFeedId = groupDataPackages(parsed.signedDataPackages);

    return dataPackagesIds.map(dataFeedId => {
      const signedDataPackages = packagesByDataFeedId[dataFeedId];
      if (!signedDataPackages) {
        throw new Error(`cannot find data packages for ${dataFeedId}`);
      }
      if (signedDataPackages.length !== uniqueSignersCount) {
        throw new Error(
          `got ${signedDataPackages.length} data packages for ${dataFeedId}, but expected ${uniqueSignersCount}`,
        );
      }
      return getCalldataWithTimestamp(
        dataFeedId,
        signedDataPackages,
        wrapper.getUnsignedMetadata(),
      );
    });
  }
}

/**
 * Groups SignedDataPackages by dataFeedId
 * @param signedDataPackages
 * @returns
 */
function groupDataPackages(
  signedDataPackages: SignedDataPackage[],
): Record<string, SignedDataPackage[]> {
  const packagesByDataFeedId: Record<string, SignedDataPackage[]> = {};
  for (const p of signedDataPackages) {
    const { dataPoints } = p.dataPackage;

    // Check if all data points have the same dataFeedId
    const dataFeedId0 = dataPoints[0].dataFeedId;
    for (const dp of dataPoints) {
      if (dp.dataFeedId !== dataFeedId0) {
        throw new Error(
          `data package contains data points with different dataFeedIds: ${dp.dataFeedId} and ${dataFeedId0}`,
        );
      }
    }

    // Group data packages by dataFeedId
    if (!packagesByDataFeedId[dataFeedId0]) {
      packagesByDataFeedId[dataFeedId0] = [];
    }
    packagesByDataFeedId[dataFeedId0].push(p);
  }

  return packagesByDataFeedId;
}

function getCalldataWithTimestamp(
  dataFeedId: string,
  packages: SignedDataPackage[],
  unsignedMetadata: string,
): TimestampedCalldata {
  const originalPayload = RedstonePayload.prepare(packages, unsignedMetadata);

  // Calculating the number of bytes in the hex representation of payload
  // We divide by 2, beacuse 2 symbols in a hex string represent one byte
  const originalPayloadLength = originalPayload.length / 2;

  // Number of bytes that we want to add to unsigned metadata so that
  // payload byte size becomes a multiplicity of 32
  const bytesToAdd = 32 - (originalPayloadLength % 32);

  // Adding underscores to the end of the metadata string, each underscore
  // uses one byte in UTF-8
  const newUnsignedMetadata = unsignedMetadata + "_".repeat(bytesToAdd);

  const payload = RedstonePayload.prepare(packages, newUnsignedMetadata);

  let timestamp = 0;
  for (const p of packages) {
    const newTimestamp = p.dataPackage.timestampMilliseconds / 1000;
    if (timestamp === 0) {
      timestamp = newTimestamp;
    } else if (timestamp !== newTimestamp) {
      throw new Error("Timestamps are not equal");
    }
  }

  return {
    dataFeedId,
    data: encodeAbiParameters(
      [{ type: "uint256" }, { type: "bytes" }],
      [BigInt(timestamp), `0x${payload}`],
    ),
    timestamp,
    cached: false,
  };
}

function isRedstone(pf: IPriceFeedContract): pf is IRedstonePriceFeedContract {
  return pf.contractType === "PRICE_FEED::REDSTONE";
}
