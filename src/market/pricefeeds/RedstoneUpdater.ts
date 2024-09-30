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
 */
export class RedstoneUpdater extends SDKConstruct {
  #logger?: ILogger;

  constructor(sdk: GearboxSDK) {
    super(sdk);
    this.#logger = childLogger("RedstoneUpdater", sdk.logger);
  }

  public async getUpdateTxs(
    feeds: RedstonePriceFeedContract[],
  ): Promise<UpdatePFTask[]> {
    this.#logger?.debug(
      `Redstone: generating update transactions for ${feeds.length} redstone price feeds`,
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
      this.#logger?.debug(
        `Redstone: fetching redstone payloads for ${group.size} data feeds in ${dataServiceId} with ${uniqueSignersCount} signers: ${Array.from(group).join(", ")}`,
      );

      const payloads = await this.#fetchPayloads(
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
    const dataPackagesIds = Array.from(dataFeedsIds);
    const wrapper = new DataServiceWrapper({
      dataServiceId,
      dataPackagesIds,
      uniqueSignersCount,
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
