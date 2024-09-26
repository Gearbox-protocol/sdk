import { PriceFeedType } from "@gearbox-protocol/sdk-gov";
import { DataServiceWrapper } from "@redstone-finance/evm-connector/dist/src/wrappers/DataServiceWrapper";
import { RedstonePayload, SignedDataPackage } from "redstone-protocol";
import {
  Address,
  Hex,
  bytesToString,
  decodeAbiParameters,
  encodeAbiParameters,
  toBytes,
} from "viem";
import { redstonePriceFeedAbi } from "../../oracles";
import { DefaultLogger } from "../../utils/Logger";
import { PriceFeedFactory } from "../market/PriceFeedFactory";
import {
  AbstractPriceFeedContract,
  PriceFeedAttachArgs,
} from "./AbstractPriceFeed";
import { UpdatePFTask } from "./types";
import { RedstonePriceFeedState } from "../state/priceFactoryState";

type abi = typeof redstonePriceFeedAbi;

interface TimestampedCalldata {
  dataFeedId: string;
  data: `0x${string}`;
  timestamp: number;
}

export class RedstonePriceFeedContract extends AbstractPriceFeedContract<abi> {
  readonly priceFeedType = "PF_REDSTONE_ORACLE";
  decimals = 8;

  dataServiceId: string;
  dataId: string;
  signers: Array<string>;
  signersThreshold: number;

  public get state(): RedstonePriceFeedState {
    return {
      ...this.contractData,
      contractType: this.priceFeedType,
      dataId: this.dataId,
      signers: this.signers,
      signersThreshold: this.signersThreshold,
      stalenessPeriod: this.stalenessPeriod,
      skipCheck: true,
    };
  }

  public static attach(args: PriceFeedAttachArgs): RedstonePriceFeedContract {
    const data = args.factory.getPriceFeedData(args.address);
    const decoder = decodeAbiParameters(
      [
        { type: "address" }, //  [0]: pf.token(),
        { type: "bytes32" }, //  [1]: pf.dataFeedId(),
        { type: "address" }, //  [2]: pf.signerAddress0(),
        { type: "address" }, //  [3]: pf.signerAddress1(),
        { type: "address" }, //  [4]: pf.signerAddress2(),
        { type: "address" }, //  [5]: pf.signerAddress3(),
        { type: "address" }, //  [6]: pf.signerAddress4(),
        { type: "address" }, //  [7]: pf.signerAddress5()
        { type: "address" }, //  [8]: pf.signerAddress6(),
        { type: "address" }, //  [9]: pf.signerAddress7(),
        { type: "address" }, // [10]: pf.signerAddress8(),
        { type: "address" }, // [11]: pf.signerAddress9(),
        { type: "uint8" }, //   [12]: pf.getUniqueSignersThreshold()
        { type: "uint128" }, // [13]: pf.lastPrice(),
        { type: "uint40" }, //  [14]: pf.lastPayloadTimestamp()
      ],
      data.serializedParams,
    );

    // TODO: add lastPrice & ;astPayloadTimestamp

    const dataId = bytesToString(toBytes(decoder[1])).replaceAll("\x00", "");

    const signers = decoder.slice(2, 11) as Array<Hex>;
    const signersThreshold = Number(decoder[12]);

    // TODO: change to load real signers from contract
    return new RedstonePriceFeedContract({
      ...args,
      dataId,
      signers,
      signersThreshold,
    });
  }

  protected constructor(args: {
    factory: PriceFeedFactory;
    address: Address;
    dataId: string;
    signers: Array<Address>;
    signersThreshold: number;
  }) {
    super({
      ...args,
      name: `RedstonePriceFeed`,
      abi: redstonePriceFeedAbi,
      updatable: true,
    });
    this.dataId = args.dataId;

    // TODO
    this.dataServiceId = ["GMX", "BAL"].includes(args.dataId)
      ? "redstone-arbitrum-prod"
      : "redstone-primary-prod";

    this.signers = args.signers;
    this.signersThreshold = args.signersThreshold;
  }

  public static async getUpdateTxs(
    feeds: RedstonePriceFeedContract[],
  ): Promise<UpdatePFTask[]> {
    DefaultLogger.debug(
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
      DefaultLogger.debug(
        `Redstone: fetching redstone payloads for ${group.size} data feeds in ${dataServiceId} with ${uniqueSignersCount} signers: ${Array.from(group).join(", ")}`,
      );

      const payloads = await RedstonePriceFeedContract.#fetchPayloads(
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
    DefaultLogger.debug(
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
  static async #fetchPayloads(
    dataServiceId: string,
    dataFeedsIds: Set<string>,
    uniqueSignersCount: number,
  ): Promise<TimestampedCalldata[]> {
    const dataFeeds = Array.from(dataFeedsIds);
    const wrapper = new DataServiceWrapper({
      dataServiceId,
      dataFeeds,
      uniqueSignersCount,
    });
    const dataPayload = await wrapper.prepareRedstonePayload(true);

    const parsed = RedstonePayload.parse(toBytes(`0x${dataPayload}`));
    const packagesByDataFeedId = groupDataPackages(parsed.signedDataPackages);

    return dataFeeds.map(dataFeedId => {
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
