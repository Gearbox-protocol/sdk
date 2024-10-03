import { DataServiceWrapper } from "@redstone-finance/evm-connector";
import type { SignedDataPackage } from "redstone-protocol";
import { RedstonePayload } from "redstone-protocol";
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
 * TODO: historical updates....
 * TODO: warp time on testnets
 */
export class RedstoneUpdater extends SDKConstruct {
  #logger?: ILogger;
  #cache = new Map<string, TimestampedCalldata>();

  constructor(sdk: GearboxSDK) {
    super(sdk);
    this.#logger = childLogger("RedstoneUpdater", sdk.logger);
  }

  public async getUpdateTxs(
    feeds: RedstonePriceFeedContract[],
    blockNumber?: bigint,
  ): Promise<UpdatePFTask[]> {
    this.#logger?.debug(
      `Redstone: generating update transactions for ${feeds.length} redstone price feeds`,
    );
    let historicalTimestamp: number | undefined;
    if (blockNumber) {
      const block = await this.sdk.provider.publicClient.getBlock({
        blockNumber,
      });
      if (!block) {
        throw new Error(`cannot get block ${blockNumber}`);
      }
      this.#logger?.debug(
        { tag: "timing" },
        `block ${block.number} ${new Date(Number(block.timestamp) * 1000)}`,
      );
      // https://github.com/redstone-finance/redstone-oracles-monorepo/blob/c7569a8eb7da1d3ad6209dfcf59c7ca508ea947b/packages/sdk/src/request-data-packages.ts#L82
      // we round the timestamp to full minutes for being compatible with
      // oracle-nodes, which usually work with rounded 10s and 60s intervals
      //
      // Also, when forking anvil->anvil (when running on testnets) block.timestamp can be in future because min ts for block is 1 seconds,
      // and scripts can take dozens of blocks (hundreds for faucet). So we take min value;
      const nowMs = new Date().getTime();
      const redstoneIntervalMs = 60_000;
      const anvilTsMs =
        redstoneIntervalMs *
        Math.floor((Number(block.timestamp) * 1000) / redstoneIntervalMs);
      const fromNowTsMs =
        redstoneIntervalMs * Math.floor(nowMs / redstoneIntervalMs - 1);
      historicalTimestamp = Math.min(anvilTsMs, fromNowTsMs);
      const deltaS = Math.floor((nowMs - historicalTimestamp) / 1000);
      this.#logger?.debug(
        { tag: "timing" },
        `will use optimistic timestamp: ${new Date(historicalTimestamp)} (${historicalTimestamp}, delta: ${deltaS}s)`,
      );
    }

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
      this.#logger?.debug(
        `Redstone: fetching redstone payloads for ${group.size} data feeds in ${dataServiceId} with ${uniqueSignersCount} signers: ${Array.from(group).join(", ")}`,
      );

      const payloads = await this.#getPayloads(
        dataServiceId,
        group,
        uniqueSignersCount,
        historicalTimestamp,
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
            description: `Redstone: updating price for ${dataFeedId} [${priceFeed.address}]`,
          }),
          timestamp,
        });
      }
    }
    this.#logger?.debug(
      `Redstone: generated  ${results.length} update transactions for redstone price feeds`,
    );
    return results;
  }

  /**
   * Gets redstone payloads in one request for multiple feeds with the same dataServiceId and uniqueSignersCount
   * If historicalTimestamp is set, responses will be cached
   * @param dataServiceId
   * @param dataFeedsIds
   * @param uniqueSignersCount
   * @param historicalTimestamp
   * @returns
   */
  async #getPayloads(
    dataServiceId: string,
    dataFeedsIds: Set<string>,
    uniqueSignersCount: number,
    historicalTimestamp?: number,
  ): Promise<TimestampedCalldata[]> {
    const fromCache: TimestampedCalldata[] = [];
    const uncached: string[] = [];
    for (const dataFeedId of dataFeedsIds) {
      const key = cacheKey(
        dataServiceId,
        dataFeedId,
        uniqueSignersCount,
        historicalTimestamp,
      );
      const cached = this.#cache.get(key);
      if (historicalTimestamp && !!cached) {
        fromCache.push(cached);
      } else {
        uncached.push(dataFeedId);
      }
    }

    const fromRedstone = await this.#fetchPayloads(
      dataServiceId,
      new Set(uncached),
      uniqueSignersCount,
      historicalTimestamp,
    );
    // cache newly fetched responses
    if (historicalTimestamp) {
      for (const resp of fromRedstone) {
        const key = cacheKey(
          dataServiceId,
          resp.dataFeedId,
          uniqueSignersCount,
          historicalTimestamp,
        );
        this.#cache.set(key, resp);
      }
    }

    return [...fromCache, ...fromRedstone];
  }

  /**
   * Fetches redstone payloads in one request for multiple feeds with the same dataServiceId and uniqueSignersCount
   * Payloads are loaded in one request to avoid redstone rate limit
   * @param dataServiceId
   * @param dataFeedsIds
   * @param uniqueSignersCount
   * @param historicalTimestamp
   * @returns
   */
  async #fetchPayloads(
    dataServiceId: string,
    dataFeedsIds: Set<string>,
    uniqueSignersCount: number,
    historicalTimestamp?: number,
  ): Promise<TimestampedCalldata[]> {
    if (dataFeedsIds.size === 0) {
      return [];
    }
    const dataPackagesIds = Array.from(dataFeedsIds);
    const wrapper = new DataServiceWrapper({
      dataServiceId,
      dataPackagesIds,
      uniqueSignersCount,
      historicalTimestamp,
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
