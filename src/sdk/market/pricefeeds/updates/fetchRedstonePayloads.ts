import { DataServiceWrapper } from "@redstone-finance/evm-connector";
import {
  RedstonePayload,
  type SignedDataPackage,
} from "@redstone-finance/protocol";
import {
  type DataServiceIds,
  getSignersForDataServiceId,
} from "@redstone-finance/sdk";
import { encodeAbiParameters, toBytes } from "viem";
import type { ILogger } from "../../../types/logger.js";
import { retry } from "../../../utils/index.js";
import type { TimestampedCalldata } from "./types.js";

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
}

export async function fetchRedstonePayloads(
  options: FetchRedstonePayloadsOptions,
): Promise<TimestampedCalldata[]> {
  const {
    dataServiceId,
    dataFeedsIds,
    uniqueSignersCount,
    historicalTimestampMs,
    gateways,
    ignoreMissingFeeds,
    enableLogging,
    logger,
  } = options;
  const metadataTimestampMs =
    historicalTimestampMs ?? options.metadataTimestampMs;

  const dataPackagesIds = Array.from(new Set(dataFeedsIds));
  if (dataPackagesIds.length === 0) {
    return [];
  }

  const wrapper = new DataServiceWrapper({
    dataServiceId,
    dataPackagesIds,
    uniqueSignersCount,
    authorizedSigners: getSignersForDataServiceId(
      dataServiceId as DataServiceIds,
    ),
    historicalTimestamp: historicalTimestampMs,
    urls: gateways,
    ignoreMissingFeed: ignoreMissingFeeds,
    enableEnhancedLogs: enableLogging,
  });
  // set deterministic metadata timestamp, so requests sent by two services at the same block are identical
  if (metadataTimestampMs) {
    wrapper.setMetadataTimestamp(metadataTimestampMs);
  }

  const dataPayload = await retry(() => wrapper.prepareRedstonePayload(true), {
    attempts: 5,
    interval: historicalTimestampMs ? 30_500 : 250,
  });

  const parsed = RedstonePayload.parse(toBytes(`0x${dataPayload}`));
  const packagesByDataFeedId = groupDataPackages(parsed.signedDataPackages);

  const result: TimestampedCalldata[] = [];

  for (const dataFeedId of dataFeedsIds) {
    const signedDataPackages = packagesByDataFeedId[dataFeedId];
    if (!signedDataPackages) {
      if (ignoreMissingFeeds) {
        logger?.warn(`cannot find data packages for ${dataFeedId}`);
        continue;
      }
      throw new Error(`cannot find data packages for ${dataFeedId}`);
    }
    if (signedDataPackages.length !== uniqueSignersCount) {
      if (ignoreMissingFeeds) {
        logger?.warn(
          `got ${signedDataPackages.length} data packages for ${dataFeedId}, but expected ${uniqueSignersCount}`,
        );
        continue;
      }
      throw new Error(
        `got ${signedDataPackages.length} data packages for ${dataFeedId}, but expected ${uniqueSignersCount}`,
      );
    }
    result.push(
      getCalldataWithTimestamp(
        dataFeedId,
        signedDataPackages,
        wrapper.getUnsignedMetadata(),
      ),
    );
  }

  return result;
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
