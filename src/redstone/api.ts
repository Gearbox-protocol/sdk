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
  pendleTwapptPriceFeedAbi,
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

  static getRedstonePriceFeeds = async ({
    priceOracleAddress,
    currentTokenData,
    provider,
    network,
  }: GetRedstoneFeedsProps) => {
    const allTokens = TypedObjectUtils.entries(currentTokenData);

    // STAGE 1: get direct price feeds and reserve price feeds
    const st1_response = (await provider.multicall({
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

    const st1_MainFeedsEnd = allTokens.length;
    const st1_MainFeedsUnsafe = st1_response.slice(0, st1_MainFeedsEnd);

    const st1_ReserveFeedsEnd = st1_MainFeedsEnd + allTokens.length;
    const st1_ReserveFeedsUnsafe = st1_response.slice(
      st1_MainFeedsEnd,
      st1_ReserveFeedsEnd,
    );

    const st1_NotTrustedMainPF = st1_MainFeedsUnsafe.reduce<
      Array<[SupportedToken, Address]>
    >((acc, p, index) => {
      const symbol = allTokens[index][0];

      if (!p.error && typeof p.result === "object" && p.result[4] === false) {
        const [priceFeed] = p.result;
        acc.push([symbol, priceFeed]);
      }
      return acc;
    }, []);
    const st1_NotTrustedMainPFRecord =
      TypedObjectUtils.fromEntries(st1_NotTrustedMainPF);

    const st1_ReservePF = st1_ReserveFeedsUnsafe.reduce<
      Array<[SupportedToken, Address]>
    >((acc, p, index) => {
      const symbol = allTokens[index][0];

      if (
        !p.error &&
        typeof p.result === "string" &&
        st1_NotTrustedMainPFRecord[symbol]
      ) {
        acc.push([symbol, p.result]);
      }
      return acc;
    }, []);

    // STAGE 2: get price feeds and their types. If type is Pendle TWAP, get the underlying price feeds for the next stage
    const st2_response = (await provider.multicall({
      allowFailure: true,
      multicallAddress: MULTICALL_ADDRESS,
      contracts: [
        ...st1_NotTrustedMainPF.map(([, address]) => ({
          address,
          abi: iPriceFeedAbi,
          functionName: "priceFeedType",
          args: [],
        })),
        ...st1_NotTrustedMainPF.map(([, address]) => ({
          address,
          abi: pendleTwapptPriceFeedAbi,
          functionName: "priceFeed",
          args: [],
        })),

        ...st1_ReservePF.map(([, address]) => ({
          address,
          abi: iPriceFeedAbi,
          functionName: "priceFeedType",
          args: [],
        })),
        ...st1_ReservePF.map(([, address]) => ({
          address,
          abi: pendleTwapptPriceFeedAbi,
          functionName: "priceFeed",
          args: [],
        })),
      ],
    })) as ViemFailableMulticallRes<Address>;

    const st2_MainFeedsTypeEnd = st1_NotTrustedMainPF.length;
    const st2_MainFeedsTypeUnsafe = st2_response.slice(0, st2_MainFeedsTypeEnd);
    const st2_MainFeedsEnd = st2_MainFeedsTypeEnd + st1_NotTrustedMainPF.length;
    const st2_MainFeedsUnsafe = st2_response.slice(
      st2_MainFeedsTypeEnd,
      st2_MainFeedsEnd,
    );

    const st2_ReserveFeedsTypeEnd = st2_MainFeedsEnd + st1_ReservePF.length;
    const st2_ReserveFeedsTypeUnsafe = st2_response.slice(
      st2_MainFeedsEnd,
      st2_ReserveFeedsTypeEnd,
    );
    const st2_ReserveFeedsEnd = st2_ReserveFeedsTypeEnd + st1_ReservePF.length;
    const st2_ReserveFeedsUnsafe = st2_response.slice(
      st2_ReserveFeedsTypeEnd,
      st2_ReserveFeedsEnd,
    );

    const st2_NotTrustedMainPF = this.unwrapSecondStage(
      st1_NotTrustedMainPF,
      st2_MainFeedsTypeUnsafe,
      st2_MainFeedsUnsafe,
    );
    const st2_ReservePF = this.unwrapSecondStage(
      st1_ReservePF,
      st2_ReserveFeedsTypeUnsafe,
      st2_ReserveFeedsUnsafe,
    );

    // STAGE 3: get price feeds and their types. If types is composite, get the underlying price feeds
    const st3_response = (await provider.multicall({
      allowFailure: true,
      multicallAddress: MULTICALL_ADDRESS,
      contracts: [
        ...st2_NotTrustedMainPF.map(([, address]) => ({
          address,
          abi: iPriceFeedAbi,
          functionName: "priceFeedType",
          args: [],
        })),
        ...st2_NotTrustedMainPF.map(([, address]) => ({
          address,
          abi: compositePriceFeedAbi,
          functionName: "priceFeed0",
          args: [],
        })),
        ...st2_NotTrustedMainPF.map(([, address]) => ({
          address,
          abi: compositePriceFeedAbi,
          functionName: "priceFeed1",
          args: [],
        })),
        ...st2_ReservePF.map(([, address]) => ({
          address,
          abi: iPriceFeedAbi,
          functionName: "priceFeedType",
          args: [],
        })),
        ...st2_ReservePF.map(([, address]) => ({
          address,
          abi: compositePriceFeedAbi,
          functionName: "priceFeed0",
          args: [],
        })),
        ...st2_ReservePF.map(([, address]) => ({
          address,
          abi: compositePriceFeedAbi,
          functionName: "priceFeed1",
          args: [],
        })),
      ],
    })) as ViemFailableMulticallRes<Address>;

    const st3_MainFeedsTypeEnd = st2_NotTrustedMainPF.length;
    const st3_MainFeedsTypeUnsafe = st3_response.slice(0, st3_MainFeedsTypeEnd);
    const st3_MainPriceFeed0End =
      st3_MainFeedsTypeEnd + st2_NotTrustedMainPF.length;
    const st3_MainPriceFeed0Unsafe = st3_response.slice(
      st3_MainFeedsTypeEnd,
      st3_MainPriceFeed0End,
    );
    const st3_MainPriceFeed1End =
      st3_MainPriceFeed0End + st2_NotTrustedMainPF.length;
    const st3_MainPriceFeed1Unsafe = st3_response.slice(
      st3_MainPriceFeed0End,
      st3_MainPriceFeed1End,
    );

    const st3_ReserveFeedsTypeEnd =
      st3_MainPriceFeed1End + st2_ReservePF.length;
    const st3_ReserveFeedsTypeUnsafe = st3_response.slice(
      st3_MainPriceFeed1End,
      st3_ReserveFeedsTypeEnd,
    );
    const st3_ReservePriceFeed0End =
      st3_ReserveFeedsTypeEnd + st2_ReservePF.length;
    const st3_ReservePriceFeed0Unsafe = st3_response.slice(
      st3_ReserveFeedsTypeEnd,
      st3_ReservePriceFeed0End,
    );
    const st3_ReservePriceFeed1End =
      st3_ReservePriceFeed0End + st2_ReservePF.length;
    const st3_ReservePriceFeed1Unsafe = st3_response.slice(
      st3_ReservePriceFeed0End,
      st3_ReservePriceFeed1End,
    );

    const st3_NotTrustedMainPF = this.unwrapThirdStage(
      st2_NotTrustedMainPF,
      st3_MainFeedsTypeUnsafe,
      st3_MainPriceFeed0Unsafe,
      st3_MainPriceFeed1Unsafe,
    );

    const st3_ReservePF = this.unwrapThirdStage(
      st2_ReservePF,
      st3_ReserveFeedsTypeUnsafe,
      st3_ReservePriceFeed0Unsafe,
      st3_ReservePriceFeed1Unsafe,
    );

    // STAGE 4: get price feed types and data feed ids for unwrapped price feeds
    const st4_response = (await provider.multicall({
      allowFailure: true,
      multicallAddress: MULTICALL_ADDRESS,
      contracts: [
        ...st3_NotTrustedMainPF.map(([, address]) => ({
          address,
          abi: iPriceFeedAbi,
          functionName: "priceFeedType",
          args: [],
        })),
        ...st3_NotTrustedMainPF.map(([, address]) => ({
          address,
          abi: redstonePriceFeedAbi,
          functionName: "dataFeedId",
          args: [],
        })),
        ...st3_ReservePF.map(([, address]) => ({
          address,
          abi: iPriceFeedAbi,
          functionName: "priceFeedType",
          args: [],
        })),
        ...st3_ReservePF.map(([, address]) => ({
          address,
          abi: redstonePriceFeedAbi,
          functionName: "dataFeedId",
          args: [],
        })),
      ],
    })) as ViemFailableMulticallRes<Address>;

    const st4_MainTypeEnd = st3_NotTrustedMainPF.length;
    const st4_MainTypeType = st4_response.slice(0, st4_MainTypeEnd);

    const st4_MainFeedIdEnd = st4_MainTypeEnd + st3_NotTrustedMainPF.length;
    const st4_MainFeedId = st4_response.slice(
      st4_MainTypeEnd,
      st4_MainFeedIdEnd,
    );

    const st4_ReserveTypeEnd = st4_MainFeedIdEnd + st3_ReservePF.length;
    const st4_ReserveType = st4_response.slice(
      st4_MainFeedIdEnd,
      st4_ReserveTypeEnd,
    );

    const st4_ReserveFeedIdEnd = st4_ReserveTypeEnd + st3_ReservePF.length;
    const st4_ReserveFeedId = st4_response.slice(
      st4_ReserveTypeEnd,
      st4_ReserveFeedIdEnd,
    );

    const getMain = (symbol: SupportedToken) =>
      getPriceFeedsByToken(symbol, network)?.Main;
    const getReserve = (symbol: SupportedToken) =>
      getPriceFeedsByToken(symbol, network)?.Reserve;

    const mainPFData = this.getRedstonePF_Onchain(
      st3_NotTrustedMainPF,
      st4_MainTypeType,
      st4_MainFeedId,
      getMain,
      currentTokenData,
      false,
      network,
    );
    const reservePFData = this.getRedstonePF_Onchain(
      st3_ReservePF,
      st4_ReserveType,
      st4_ReserveFeedId,
      getReserve,
      currentTokenData,
      true,
      network,
    );

    const allReserve = st3_ReservePF.reduce<Record<Address, Array<Address>>>(
      (acc, [s, pf]) => {
        const token = currentTokenData[s];

        if (!acc[token]) acc[token] = [];
        acc[token].push(pf);

        return acc;
      },
      {},
    );
    return {
      main: mainPFData,
      reserve: reservePFData,
      allReserve,
    };
  };

  private static unwrapSecondStage(
    priceFeeds: Array<[SupportedToken, Address]>,
    feedsTypeResponse: SafeMulticallResponse,
    priceFeedResponse: SafeMulticallResponse,
  ) {
    const result = priceFeeds.reduce<Array<[SupportedToken, Address]>>(
      (acc, [symbol, baseAddress], index) => {
        const { error: typeError, result: feedType } = feedsTypeResponse[index];
        const { error: feedError, result: feed } = priceFeedResponse[index];

        const isRedstone =
          !typeError && Number(feedType) === PriceFeedType.REDSTONE_ORACLE;
        const hasFeed = !feedError && typeof feed === "string";

        if (isRedstone) {
          acc.push([symbol, baseAddress]);
        } else if (hasFeed) {
          acc.push([symbol, feed]);
        } else {
          acc.push([symbol, baseAddress]);
        }

        return acc;
      },
      [],
    );

    return result;
  }

  private static unwrapThirdStage(
    priceFeeds: Array<[SupportedToken, Address]>,
    feedsTypeResponse: SafeMulticallResponse,
    priceFeed0Response: SafeMulticallResponse,
    priceFeed1Response: SafeMulticallResponse,
  ) {
    const result = priceFeeds.reduce<Array<[SupportedToken, Address]>>(
      (acc, [symbol, baseAddress], index) => {
        const { error: typeError, result: feedType } = feedsTypeResponse[index];
        const { error: feed0Error, result: feed0 } = priceFeed0Response[index];
        const { error: feed1Error, result: feed1 } = priceFeed1Response[index];

        const isRedstone =
          !typeError && Number(feedType) === PriceFeedType.REDSTONE_ORACLE;
        const hasFeed0 = !feed0Error && typeof feed0 === "string";
        const hasFeed1 = !feed1Error && typeof feed1 === "string";

        if (isRedstone) {
          acc.push([symbol, baseAddress]);
        } else if (hasFeed0 || hasFeed1) {
          if (hasFeed0) {
            acc.push([symbol, feed0]);
          }
          if (hasFeed1) {
            acc.push([symbol, feed1]);
          }
        } else {
          acc.push([symbol, baseAddress]);
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
            const ticker = unsafeTicker?.find(
              t => t.priceFeed.toLowerCase() === feedAddressLc,
            );
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
              reserve: ticker ? ticker.reserve : reserve,

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
