import type {
  Address,
  ContractFunctionParameters,
  ContractFunctionReturnType,
} from "viem";

import type { iPriceFeedCompressorAbi } from "../../../abi/compressors.js";
import type { IBaseContract } from "../../base/index.js";
import type { MultiCall, PriceOracleStateHuman } from "../../types/index.js";
import type { AddressMap } from "../../utils/index.js";
import type {
  IPriceFeedContract,
  PriceFeedRef,
  UpdatePriceFeedsResult,
} from "../pricefeeds/index.js";
import type PriceFeedAnswerMap from "./PriceFeedAnswerMap.js";

export interface PriceFeedsForTokensOptions {
  main?: boolean;
  reserve?: boolean;
}

/**
 * Abstraction that represents on demand price updates acceptable by both credit facade multicall and
 * as raw PriceUpdate in liquidator calls
 * T is (priceFeed, data) for v310 and (token, reserve, data) for v300
 * TODO: should be removed after v310 migration
 */
export interface OnDemandPriceUpdates<T = unknown> {
  raw: T[];
  multicall: MultiCall[];
}

export interface IPriceOracleContract extends IBaseContract {
  mainPriceFeeds: AddressMap<PriceFeedRef>;
  mainPrices: PriceFeedAnswerMap;
  /**
   * Gets main price for given token
   * Throws if token price feed is not found or answer is not successful
   * @param token
   * @returns
   */
  mainPrice: (token: Address) => bigint;

  reservePriceFeeds: AddressMap<PriceFeedRef>;
  reservePrices: PriceFeedAnswerMap;
  /**
   * Gets reserve price for given token
   * Throws if token price feed is not found or answer is not successful
   * @param token
   * @returns
   */
  reservePrice: (token: Address) => bigint;

  /**
   * Loads new prices for this oracle from PriceFeedCompressor
   * Will (re)create price feeds if needed
   */
  updatePrices: () => Promise<void>;
  /**
   * Paired method to updatePrices, helps to update prices on all oracles in one multicall
   */
  syncStateMulticall: () => DelegatedOracleMulticall;

  /**
   * Returns true if oracle's price feed tree contains given price feed
   * This feed is not necessary connected to token, but can be a component of composite feed for some token
   * @param priceFeed
   * @returns
   */
  usesPriceFeed: (priceFeed: Address) => boolean;
  /**
   * Helper method to find "attachment point" of price feed (makes sense for updatable price feeds only) -
   * returns token (in v300 can be ticker) and main/reserve flag
   *
   * @deprecated Should be gone after v310 migration
   *
   * @param priceFeed
   * @returns
   */
  findTokenForPriceFeed: (
    priceFeed: Address,
  ) => [token: Address | undefined, reserve: boolean];

  /**
   * Returns main and reserve price feeds for given tokens
   * @param tokens
   * @param opts Option to include main/reserve feeds only, defaults to both
   * @returns
   */
  priceFeedsForTokens: (
    tokens: Address[],
    opts?: PriceFeedsForTokensOptions,
  ) => IPriceFeedContract[];
  /**
   * Generates updates for all updateable price feeds in this oracle (including dependencies)
   * @returns
   */
  updatePriceFeeds: () => Promise<UpdatePriceFeedsResult>;
  /**
   * Converts previously obtained price updates into CreditFacade multicall entries
   * @param creditFacade
   * @param updates
   * @returns
   */
  onDemandPriceUpdates: (
    creditFacade: Address,
    updates?: UpdatePriceFeedsResult,
  ) => OnDemandPriceUpdates;
  /**
   * Tries to convert amount of from one token to another, using latest known prices
   * @param from
   * @param to
   * @param amount
   * @param reserve use reserve price feed instead of main
   */
  convert: (
    from: Address,
    to: Address,
    amount: bigint,
    reserve?: boolean,
  ) => bigint;
  /**
   * Tries to convert amount of token to USD, using latest known prices
   * @param from
   * @param amount
   * @param reserve use reserve price feed instead of main
   */
  convertToUSD: (from: Address, amount: bigint, reserve?: boolean) => bigint;
  /**
   * Tries to convert amount of USD to token, using latest known prices
   * @param to
   * @param amount
   * @param reserve use reserve price feed instead of main
   */
  convertFromUSD: (to: Address, amount: bigint, reserve?: boolean) => bigint;
  /**
   * Returns list of addresses that should be watched for events to sync state
   */
  watchAddresses: Set<Address>;
  /**
   * Returns human readable state of the oracle
   */
  stateHuman: (raw?: boolean) => PriceOracleStateHuman;
}

export interface DelegatedOracleMulticall {
  call: ContractFunctionParameters<
    typeof iPriceFeedCompressorAbi,
    "view",
    "getPriceOracleState"
  >;
  onResult: (
    resp: ContractFunctionReturnType<
      typeof iPriceFeedCompressorAbi,
      "view",
      "getPriceOracleState"
    >,
  ) => void;
}
