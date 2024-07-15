import {
  getPriceFeedsByToken,
  MULTICALL_ADDRESS,
  NetworkType,
  PriceFeedData,
  PriceFeedType,
  REDSTONE_SIGNERS,
  SupportedToken,
  TickerInfo,
  tickerInfoTokensByNetwork,
  toBigInt,
  TypedObjectUtils,
} from "@gearbox-protocol/sdk-gov";
import { DataServiceWrapper } from "@redstone-finance/evm-connector/dist/src/wrappers/DataServiceWrapper";
import { SignedDataPackage } from "@redstone-finance/protocol";
import { RedstonePayload } from "redstone-protocol";
import {
  Address,
  bytesToString,
  encodeAbiParameters,
  hexToBytes,
  parseAbiParameters,
  PublicClient,
} from "viem";

import {
  compositePriceFeedAbi,
  iPriceFeedAbi,
  iPriceOracleV3Abi,
  redstonePriceFeedAbi,
} from "../types";
import { ViemFailableMulticallRes } from "../utils/calls";

export const DEFAULT_DATA_SERVICE_ID = "redstone-primary-prod";
export const REDSTONE_SIGNERS_THRESHOLD = REDSTONE_SIGNERS.signersThreshold;

interface RedstonePriceFeedInfo {
  tokenAddress: Address;
  tickedTokenAddress: Address;
  symbol: SupportedToken;

  feedAddress: Address;
  dataFeedId: string;
  tickedDataFeedId: string;
  dataServiceId: string;
  reserve: boolean;

  ticker?: TickerInfo;
}

export type RedstonePriceFeeds = Array<RedstonePriceFeedInfo>;

export interface GetRedstoneFeedsProps {
  provider: PublicClient;
  currentTokenData: Record<SupportedToken, Address>;
  priceOracleAddress: Address;
  network: NetworkType;
}

type PriceFeedParams = [Address, number, boolean, number, boolean];

type RedstonePriceFeedData = Omit<
  Extract<PriceFeedData, { type: PriceFeedType.REDSTONE_ORACLE }>,
  "stalenessPeriod"
>;

type SafeMulticallResponse = Array<{
  error?: Error | undefined;
  result?: Address | undefined;
}>;

const REDSTONE_DICTIONARY: Record<string, string> = {
  STETH: "stETH",
};

export class RedstoneApi {
  static async getPricesBulk(feedsToUpdate: Array<RedstonePriceFeedInfo>) {
    const pricesOnDemand = await Promise.all(
      feedsToUpdate.map(f =>
        this.getRedstonePayloadForManualUsage(
          f.dataServiceId,
          f.tickedDataFeedId,
          REDSTONE_SIGNERS_THRESHOLD,
        ),
      ),
    );

    return pricesOnDemand;
  }
  static getRedstonePayloadForManualUsage = async (
    dataServiceId: string,
    dataFeeds: string,
    uniqueSignersCount: number,
  ) => {
    const wrapper = new DataServiceWrapper({
      dataServiceId,
      dataFeeds: [dataFeeds],
      uniqueSignersCount,
    });
    const dataPayload = await wrapper.prepareRedstonePayload(true);

    const { signedDataPackages, unsignedMetadata } = RedstonePayload.parse(
      hexToBytes(`0x${dataPayload}`),
    );

    const dataPackagesList = this.splitResponse(
      signedDataPackages,
      uniqueSignersCount,
    );

    const result = dataPackagesList.map(list => {
      const payload = new RedstonePayload(
        list,
        bytesToString(unsignedMetadata),
      );

      let ts = 0;
      list.forEach(p => {
        const newTimestamp = p.dataPackage.timestampMilliseconds / 1000;
        if (ts === 0) {
          ts = newTimestamp;
        } else if (ts !== newTimestamp) {
          throw new Error("Timestamps are not equal");
        }
      });

      return encodeAbiParameters(parseAbiParameters("uint256, bytes"), [
        toBigInt(ts),
        `0x${payload.toBytesHexWithout0xPrefix()}`,
      ]) as Address;
    });

    return result[0];
  };

  static async getDataPackagesBulk(
    feedsToUpdate: Array<RedstonePriceFeedInfo>,
  ) {
    const feedsByServiceId = feedsToUpdate.reduce<
      Record<string, Array<RedstonePriceFeedInfo>>
    >((acc, f) => {
      const { dataServiceId = DEFAULT_DATA_SERVICE_ID } = f;

      if (!acc[dataServiceId]) acc[dataServiceId] = [];
      acc[dataServiceId].push(f);

      return acc;
    }, {});

    const groupedFeedsList = Object.values(feedsByServiceId);

    const response = await Promise.all(
      groupedFeedsList.map(gr =>
        this.getDataPackages(
          gr[0].dataServiceId || DEFAULT_DATA_SERVICE_ID,
          gr.map(f => f.tickedDataFeedId),
          REDSTONE_SIGNERS_THRESHOLD,
        ),
      ),
    );

    const respList = groupedFeedsList.reduce<
      Array<[string, Array<SignedDataPackage>]>
    >((acc, gr, i) => {
      const groupResponse = response[i];

      gr.forEach((feed, j) => {
        const start = j * REDSTONE_SIGNERS_THRESHOLD;
        const end = (j + 1) * REDSTONE_SIGNERS_THRESHOLD;

        const feedPackages = groupResponse.slice(start, end);

        if (feedPackages.length !== REDSTONE_SIGNERS_THRESHOLD) {
          throw new Error(
            `Redstone price packages response length mismatch: expected: ${REDSTONE_SIGNERS_THRESHOLD}, got: ${feedPackages.length}`,
          );
        }

        acc.push([feed.tokenAddress, feedPackages]);
      });

      return acc;
    }, []);

    if (respList.length !== feedsToUpdate.length) {
      throw new Error(
        `Redstone price packages response length mismatch: expected: ${feedsToUpdate.length}, got: ${respList.length}`,
      );
    }

    const respRecord = Object.fromEntries(respList);
    return respRecord;
  }
  private static getDataPackages = async (
    dataServiceId: string,
    dataFeeds: Array<string>,
    uniqueSignersCount: number,
  ) => {
    const wrapper = new DataServiceWrapper({
      dataServiceId: dataServiceId,
      dataFeeds: dataFeeds,
      uniqueSignersCount: uniqueSignersCount,
    });
    const dataPayload = await wrapper.getDataPackagesForPayload();

    return dataPayload;
  };

  private static splitResponse = <T>(arr: Array<T>, size: number) => {
    const chunks = [];

    for (let i = 0; i < arr.length; i += size) {
      const chunk = arr.slice(i, i + size);
      chunks.push(chunk);
    }

    return chunks;
  };

  static getRedstonePriceFeedsSDK = async ({
    priceOracleAddress,
    currentTokenData,
    provider,
    network,
  }: GetRedstoneFeedsProps) => {
    const allTokens = TypedObjectUtils.entries(currentTokenData);

    const { main: mainRedstone, reserve: reserveRedstone } = allTokens.reduce<{
      main: Array<[SupportedToken, RedstonePriceFeedData]>;
      reserve: Array<[SupportedToken, RedstonePriceFeedData]>;
    }>(
      (acc, [t]) => {
        const { Main, Reserve } = getPriceFeedsByToken(t, network) || {};

        const notTrusted = Main?.trusted === false;
        const reserveRedstone = Reserve?.type === PriceFeedType.REDSTONE_ORACLE;

        if (notTrusted && reserveRedstone) {
          acc.reserve.push([t, Reserve]);
        }

        if (
          notTrusted &&
          Reserve?.type === PriceFeedType.COMPOSITE_ORACLE &&
          typeof Reserve.targetToBasePriceFeed !== "string" &&
          Reserve.targetToBasePriceFeed.type === PriceFeedType.REDSTONE_ORACLE
        ) {
          acc.reserve.push([t, Reserve.targetToBasePriceFeed]);
        }

        if (Main?.type === PriceFeedType.REDSTONE_ORACLE) {
          acc.main.push([t, Main]);
        }

        if (
          Main?.type === PriceFeedType.COMPOSITE_ORACLE &&
          typeof Main.targetToBasePriceFeed !== "string" &&
          Main.targetToBasePriceFeed.type === PriceFeedType.REDSTONE_ORACLE
        ) {
          acc.main.push([t, Main.targetToBasePriceFeed]);
        }

        return acc;
      },
      { main: [], reserve: [] },
    );

    const priceFeedsResp = (await provider.multicall({
      allowFailure: true,
      multicallAddress: MULTICALL_ADDRESS,
      contracts: [
        ...mainRedstone.map(([symbol]) => ({
          address: priceOracleAddress,
          abi: iPriceOracleV3Abi,
          functionName: "priceFeedsRaw",
          args: [currentTokenData[symbol], false],
        })),
        ...reserveRedstone.map(([symbol]) => ({
          address: priceOracleAddress,
          abi: iPriceOracleV3Abi,
          functionName: "priceFeedsRaw",
          args: [currentTokenData[symbol], true],
        })),
      ],
    })) as ViemFailableMulticallRes<Address>;

    const mainPFEnd = mainRedstone.length;
    const mainPFAddresses = priceFeedsResp.slice(0, mainPFEnd);

    const mainPFData = this.getRedstonePF_SDK(
      mainRedstone,
      mainPFAddresses,
      currentTokenData,
      false,
      network,
    );

    const reservePFEnd = mainPFEnd + reserveRedstone.length;
    const reservePFAddresses = priceFeedsResp.slice(mainPFEnd, reservePFEnd);

    const reservePFData = this.getRedstonePF_SDK(
      reserveRedstone,
      reservePFAddresses,
      currentTokenData,
      true,
      network,
    );

    return { main: mainPFData, reserve: reservePFData };
  };

  private static getRedstonePF_SDK(
    sdkPF: Array<[SupportedToken, RedstonePriceFeedData]>,
    addressResponse: SafeMulticallResponse,
    currentTokenData: Record<SupportedToken, Address>,
    reserve: boolean,
    network: NetworkType,
  ) {
    const tickers = tickerInfoTokensByNetwork[network];

    const r = sdkPF.reduce<RedstonePriceFeeds>(
      (acc, [symbol, feedData], index) => {
        const { dataId: dataFeedId, dataServiceId } = feedData || {};

        const { result: feedAddress, error: feedError } =
          addressResponse[index] || {};
        const feedAddressLc = feedAddress?.toLowerCase() as Address;
        const hasId = !feedError && typeof feedAddressLc === "string";

        if (hasId && dataFeedId && dataServiceId) {
          const unsafeTicker = tickers[symbol];
          const ticker =
            unsafeTicker?.priceFeed.toLowerCase() === feedAddressLc
              ? unsafeTicker
              : undefined;
          const tokenAddress = currentTokenData[symbol];

          acc.push({
            tickedTokenAddress: (
              ticker?.address || tokenAddress
            ).toLowerCase() as Address,
            tokenAddress,
            symbol,

            feedAddress: feedAddressLc,
            dataFeedId: dataFeedId,
            tickedDataFeedId: ticker?.dataId || dataFeedId,
            dataServiceId,
            reserve,

            ticker,
          });
        } else {
          throw new Error(
            `Redstone price feed (${symbol}) is missing one or more fields. feed: ${feedAddressLc}, dataFeedId: ${dataFeedId}, dataServiceId: ${dataServiceId}`,
          );
        }

        return acc;
      },
      [],
    );

    return r;
  }

  static getRedstonePriceFeeds = async ({
    priceOracleAddress,
    currentTokenData,
    provider,
    network,
  }: GetRedstoneFeedsProps) => {
    const allTokens = TypedObjectUtils.entries(currentTokenData);

    const feeds = (await provider.multicall({
      allowFailure: true,
      multicallAddress: MULTICALL_ADDRESS,
      contracts: [
        ...allTokens.map(([, a]) => ({
          address: priceOracleAddress,
          abi: iPriceOracleV3Abi,
          functionName: "priceFeedParams",
          args: [a],
        })),
        ...allTokens.map(([symbol]) => ({
          address: priceOracleAddress,
          abi: iPriceOracleV3Abi,
          functionName: "priceFeedsRaw",
          args: [currentTokenData[symbol], true],
        })),
      ],
    })) as ViemFailableMulticallRes<PriceFeedParams | Address>;

    const mainFeedsEnd = allTokens.length;
    const mainFeedsUnsafe = feeds.slice(0, mainFeedsEnd);

    const reserveFeedsEnd = mainFeedsEnd + allTokens.length;
    const reserveFeedsUnsafe = feeds.slice(mainFeedsEnd, reserveFeedsEnd);

    const notTrustedMainPF = mainFeedsUnsafe.reduce<
      Array<[SupportedToken, Address]>
    >((acc, p, index) => {
      const symbol = allTokens[index][0];

      if (!p.error && typeof p.result === "object" && p.result[4] === false) {
        const [priceFeed] = p.result;
        acc.push([symbol, priceFeed]);
      }
      return acc;
    }, []);
    const notTrustedMainPFRecord =
      TypedObjectUtils.fromEntries(notTrustedMainPF);

    const reservePF = reserveFeedsUnsafe.reduce<
      Array<[SupportedToken, Address]>
    >((acc, p, index) => {
      const symbol = allTokens[index][0];

      if (
        !p.error &&
        typeof p.result === "string" &&
        notTrustedMainPFRecord[symbol]
      ) {
        acc.push([symbol, p.result]);
      }
      return acc;
    }, []);

    const typeResponse = (await provider.multicall({
      allowFailure: true,
      multicallAddress: MULTICALL_ADDRESS,
      contracts: [
        ...notTrustedMainPF.map(([, address]) => ({
          address,
          abi: iPriceFeedAbi,
          functionName: "priceFeedType",
          args: [],
        })),
        ...notTrustedMainPF.map(([, address]) => ({
          address,
          abi: compositePriceFeedAbi,
          functionName: "priceFeed0",
          args: [],
        })),
        ...reservePF.map(([, address]) => ({
          address,
          abi: iPriceFeedAbi,
          functionName: "priceFeedType",
          args: [],
        })),
        ...reservePF.map(([, address]) => ({
          address,
          abi: compositePriceFeedAbi,
          functionName: "priceFeed0",
          args: [],
        })),
      ],
    })) as ViemFailableMulticallRes<Address>;

    const mainFeedsTypeEnd = notTrustedMainPF.length;
    const mainFeedsTypeUnsafe = typeResponse.slice(0, mainFeedsTypeEnd);
    const mainPriceFeed0End = mainFeedsTypeEnd + notTrustedMainPF.length;
    const mainPriceFeed0Unsafe = typeResponse.slice(
      mainFeedsTypeEnd,
      mainPriceFeed0End,
    );

    const reserveFeedsTypeEnd = mainPriceFeed0End + reservePF.length;
    const reserveFeedsTypeUnsafe = typeResponse.slice(
      mainPriceFeed0End,
      reserveFeedsTypeEnd,
    );
    const reservePriceFeed0End = reserveFeedsTypeEnd + reservePF.length;
    const reservePriceFeed0Unsafe = typeResponse.slice(
      reserveFeedsTypeEnd,
      reservePriceFeed0End,
    );

    const realNotTrustedMainPriceFeeds = this.getPriceFeedsOfInterest_Onchain(
      notTrustedMainPF,
      mainFeedsTypeUnsafe,
      mainPriceFeed0Unsafe,
    );

    const realReservePriceFeeds = this.getPriceFeedsOfInterest_Onchain(
      reservePF,
      reserveFeedsTypeUnsafe,
      reservePriceFeed0Unsafe,
    );

    const response = (await provider.multicall({
      allowFailure: true,
      multicallAddress: MULTICALL_ADDRESS,
      contracts: [
        ...realNotTrustedMainPriceFeeds.map(([, address]) => ({
          address,
          abi: iPriceFeedAbi,
          functionName: "priceFeedType",
          args: [],
        })),
        ...realNotTrustedMainPriceFeeds.map(([, address]) => ({
          address,
          abi: redstonePriceFeedAbi,
          functionName: "dataFeedId",
          args: [],
        })),
        ...realReservePriceFeeds.map(([, address]) => ({
          address,
          abi: iPriceFeedAbi,
          functionName: "priceFeedType",
          args: [],
        })),
        ...realReservePriceFeeds.map(([, address]) => ({
          address,
          abi: redstonePriceFeedAbi,
          functionName: "dataFeedId",
          args: [],
        })),
      ],
    })) as ViemFailableMulticallRes<Address>;

    const mainTypeEnd = realNotTrustedMainPriceFeeds.length;
    const mainTypeType = response.slice(0, mainTypeEnd);

    const mainFeedIdEnd = mainTypeEnd + realNotTrustedMainPriceFeeds.length;
    const mainFeedId = response.slice(mainTypeEnd, mainFeedIdEnd);

    const reserveTypeEnd = mainFeedIdEnd + realReservePriceFeeds.length;
    const reserveType = response.slice(mainFeedIdEnd, reserveTypeEnd);

    const reserveFeedIdEnd = reserveTypeEnd + realReservePriceFeeds.length;
    const reserveFeedId = response.slice(reserveTypeEnd, reserveFeedIdEnd);

    const getMain = (symbol: SupportedToken) =>
      getPriceFeedsByToken(symbol, network)?.Main;
    const getReserve = (symbol: SupportedToken) =>
      getPriceFeedsByToken(symbol, network)?.Reserve;

    const mainPFData = this.getRedstonePF_Onchain(
      realNotTrustedMainPriceFeeds,
      mainTypeType,
      mainFeedId,
      getMain,
      currentTokenData,
      false,
      network,
    );
    const reservePFData = this.getRedstonePF_Onchain(
      realReservePriceFeeds,
      reserveType,
      reserveFeedId,
      getReserve,
      currentTokenData,
      true,
      network,
    );

    return {
      main: mainPFData,
      reserve: reservePFData,
      allReserve: TypedObjectUtils.fromEntries(
        reservePF.map(([s, a]) => [currentTokenData[s], a]),
      ),
    };
  };

  private static getPriceFeedsOfInterest_Onchain(
    priceFeeds: Array<[SupportedToken, Address]>,
    feedsTypeResponse: SafeMulticallResponse,
    priceFeed0Response: SafeMulticallResponse,
  ) {
    const result = priceFeeds.reduce<Array<[SupportedToken, Address]>>(
      (acc, [symbol, baseAddress], index) => {
        const { error: typeError, result: feedType } = feedsTypeResponse[index];
        const { error: feed0Error, result: feed0 } = priceFeed0Response[index];

        const isRedstone =
          !typeError && Number(feedType) === PriceFeedType.REDSTONE_ORACLE;
        const isComposite =
          !typeError && Number(feedType) === PriceFeedType.COMPOSITE_ORACLE;

        if (isRedstone) {
          acc.push([symbol, baseAddress]);
        }

        const hasFeed0 = !feed0Error && typeof feed0 === "string";
        if (isComposite && hasFeed0) {
          acc.push([symbol, feed0]);
        }

        return acc;
      },
      [],
    );

    return result;
  }

  private static getRedstonePF_Onchain(
    feeds: Array<[SupportedToken, Address]>,
    typeResponse: SafeMulticallResponse,
    idResponse: SafeMulticallResponse,
    getFeedInfo: (symbol: SupportedToken) => PriceFeedData | undefined,
    currentTokenData: Record<SupportedToken, Address>,
    reserve: boolean,
    network: NetworkType,
  ) {
    const tickers = tickerInfoTokensByNetwork[network];

    const r = feeds.reduce<RedstonePriceFeeds>(
      (acc, [symbol, feedAddress], index) => {
        const feedAddressLc = feedAddress.toLowerCase() as Address;
        const { error: typeError, result: feedType } = typeResponse[index];
        const isRedstone =
          !typeError && Number(feedType) === PriceFeedType.REDSTONE_ORACLE;

        const { result: dataFeedId, error: idError } = idResponse[index];
        const hasId = !idError && typeof dataFeedId === "string";

        if (isRedstone) {
          if (hasId) {
            const feedData = getFeedInfo(symbol) as
              | RedstonePriceFeedData
              | undefined;
            const dataServiceId = feedData?.dataServiceId;

            const id = bytesToString(hexToBytes(dataFeedId))
              .trim()
              .replace(/\u0000/g, "");

            const unsafeTicker = tickers[symbol];
            const ticker =
              unsafeTicker?.priceFeed.toLowerCase() === feedAddressLc
                ? unsafeTicker
                : undefined;
            const tokenAddress = currentTokenData[symbol];
            const defaultDataId = REDSTONE_DICTIONARY[id] || id;

            acc.push({
              tickedTokenAddress: (
                ticker?.address || tokenAddress
              ).toLowerCase() as Address,
              tokenAddress: tokenAddress,
              symbol,

              feedAddress: feedAddressLc,
              dataFeedId: defaultDataId,
              tickedDataFeedId: ticker?.dataId || defaultDataId,
              dataServiceId: dataServiceId || DEFAULT_DATA_SERVICE_ID,
              reserve,

              ticker,
            });
          } else {
            throw new Error(
              `Redstone price feed ${symbol}) has no dataFeedId: ${feedAddressLc}`,
            );
          }
        }

        return acc;
      },
      [],
    );

    return r;
  }
}
