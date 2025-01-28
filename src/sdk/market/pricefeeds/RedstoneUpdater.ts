/* eslint-disable accessor-pairs */
import { DataServiceWrapper } from "@redstone-finance/evm-connector";
import type { SignedDataPackage } from "@redstone-finance/protocol";
import { RedstonePayload } from "@redstone-finance/protocol";
import type { Address, Hex } from "viem";
import { encodeAbiParameters, toBytes } from "viem";

import { SDKConstruct } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import type { ILogger, RawTx } from "../../types";
import { childLogger } from "../../utils";
import type { RedstonePriceFeedContract } from "./RedstonePriceFeed";

interface TimestampedCalldata {
  dataFeedId: string;
  data: `0x${string}`;
  timestamp: number;
}

interface UpdatePFTask {
  priceFeed: Address;
  tx: RawTx;
  timestamp: number;
}

/**
 * Class to update multiple redstone price feeds at once
 */
export class RedstoneUpdater extends SDKConstruct {
  #logger?: ILogger;
  #cache = new Map<string, TimestampedCalldata>();
  #historicalTimestampMs?: number;
  #gateways?: string[];

  constructor(sdk: GearboxSDK) {
    super(sdk);
    this.#logger = childLogger("RedstoneUpdater", sdk.logger);
  }

  /**
   * Set redstone historical timestamp in milliseconds
   */
  public set historicalTimestamp(timestampMs: number) {
    // redstone timestamps are rounded to one minute
    this.#historicalTimestampMs = 60_000 * Math.floor(timestampMs / 60_000);
  }

  /**
   * Set redstone gateways
   */
  public set gateways(gateways: string[]) {
    this.#gateways = gateways;
  }

  public async getUpdateTxs(
    feeds: RedstonePriceFeedContract[],
    logContext: Record<string, any> = {},
  ): Promise<UpdatePFTask[]> {
    this.#logger?.debug(
      logContext,
      `generating update transactions for ${feeds.length} redstone price feeds`,
    );

    // Group feeds by dataServiceId and uniqueSignersCount
    const groupedFeeds: Record<string, Set<string>> = {};
    const priceFeeds = new Map<string, RedstonePriceFeedContract>();
    for (const feed of feeds) {
      const key = `${feed.dataServiceId}:${feed.signersThreshold}`;
      if (!groupedFeeds[key]) {
        groupedFeeds[key] = new Set();
      }
      groupedFeeds[key].add(feed.dataId);
      priceFeeds.set(feed.dataId, feed);
    }

    const results: UpdatePFTask[] = [];
    for (const [key, group] of Object.entries(groupedFeeds)) {
      const [dataServiceId, signersStr] = key.split(":");
      const uniqueSignersCount = parseInt(signersStr, 10);
      const payloads = await this.#getPayloads(
        dataServiceId,
        group,
        uniqueSignersCount,
      );

      for (const { dataFeedId, data, timestamp } of payloads) {
        const priceFeed = priceFeeds.get(dataFeedId);
        if (!priceFeed) {
          throw new Error(`cannot get price feed address for ${dataFeedId}`);
        }
        results.push({
          priceFeed: priceFeed.address.toLowerCase() as Address,
          tx: priceFeed.createRawTx({
            functionName: "updatePrice",
            args: [data as Hex],
            description: `updating price for ${dataFeedId} [${this.sdk.provider.addressLabels.get(priceFeed.address)}]`,
          }),
          timestamp,
        });
      }
    }
    this.#logger?.debug(
      logContext,
      `generated ${results.length} update transactions for redstone price feeds`,
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
      const key = cacheKey(
        dataServiceId,
        dataFeedId,
        uniqueSignersCount,
        this.#historicalTimestampMs,
      );
      const cached = this.#cache.get(key);
      if (this.#historicalTimestampMs && !!cached) {
        fromCache.push(cached);
      } else {
        uncached.push(dataFeedId);
      }
    }

    const fromRedstone = await this.#fetchPayloads(
      dataServiceId,
      new Set(uncached),
      uniqueSignersCount,
    );
    // cache newly fetched responses
    if (this.#historicalTimestampMs) {
      for (const resp of fromRedstone) {
        const key = cacheKey(
          dataServiceId,
          resp.dataFeedId,
          uniqueSignersCount,
          this.#historicalTimestampMs,
        );
        this.#cache.set(key, resp);
      }
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
      historicalTimestamp: this.#historicalTimestampMs,
      urls: this.#gateways,
    });

    const dataPayload = await wrapper.prepareRedstonePayload(true);

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

function cacheKey(
  dataServiceId: string,
  dataFeedId: string,
  uniqueSignersCount: number,
  historicalTimestamp = 0,
): string {
  return `${dataServiceId}:${dataFeedId}:${uniqueSignersCount}:${historicalTimestamp}`;
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
  };
}
