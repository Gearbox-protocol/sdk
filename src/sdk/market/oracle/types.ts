import type { Address } from "viem";
import type { IBaseContract } from "../../base/index.js";
import type { MultiCall, PriceOracleStateHuman } from "../../types/index.js";
import type { AddressMap } from "../../utils/index.js";
import type { DelegatedMulticall } from "../../utils/viem/index.js";
import type {
  IPriceFeedContract,
  PriceFeedRef,
  PriceUpdate,
  UpdatePriceFeedsResult,
} from "../pricefeeds/index.js";
import type PriceFeedAnswerMap from "./PriceFeedAnswerMap.js";

/**
 * Filter controlling which feed types to include when querying
 * price feeds for a set of tokens. Both default to `true`.
 **/
export interface PriceFeedsForTokensOptions {
  /**
   * Include main (primary) price feeds.
   * @default true
   **/
  main?: boolean;
  /**
   * Include reserve (fallback) price feeds.
   * @default true
   **/
  reserve?: boolean;
}

/**
 * On demand price updates acceptable by both credit facade multicall and
 * as raw PriceUpdate in liquidator calls.
 */
export interface OnDemandPriceUpdates {
  raw: PriceUpdate[];
  multicall: MultiCall[];
}

/**
 * Public interface for a Gearbox price oracle contract.
 *
 * Each Gearbox market has one price oracle that aggregates USD-denominated
 * price feeds for every collateral token.
 **/
export interface IPriceOracleContract extends IBaseContract {
  /**
   * All price feed contract instances known to this oracle
   **/
  priceFeeds: IPriceFeedContract[];
  /**
   * Main price feed references, keyed by token address.
   **/
  mainPriceFeeds: AddressMap<PriceFeedRef>;
  /**
   * Latest main prices in USD (8 decimals), keyed by token address.
   **/
  mainPrices: PriceFeedAnswerMap;
  /**
   * Returns the main USD price for a token.
   * @param token - Token address.
   * @throws If the token has no main feed or the answer failed.
   **/
  mainPrice: (token: Address) => bigint;

  /**
   * Reserve price feed references, keyed by token address.
   **/
  reservePriceFeeds: AddressMap<PriceFeedRef>;
  /**
   * Latest reserve prices in USD (8 decimals), keyed by token address.
   **/
  reservePrices: PriceFeedAnswerMap;
  /**
   * Returns the reserve USD price for a token.
   * @param token - Token address.
   * @throws If the token has no reserve feed or the answer failed.
   **/
  reservePrice: (token: Address) => bigint;

  /**
   * @internal
   **/
  syncStateMulticall: () => DelegatedMulticall;

  /**
   * Checks whether the given price feed address appears anywhere in this
   * oracle's feed tree (including as a dependency of a composite feed,
   * not just directly assigned to a token).
   * @param priceFeed - Price feed address to look up.
   **/
  usesPriceFeed: (priceFeed: Address) => boolean;

  /**
   * Collects the main and/or reserve price feeds assigned to the given tokens.
   * @param tokens - Token addresses to query.
   * @param opts - Filter to include only main or only reserve feeds.
   **/
  priceFeedsForTokens: (
    tokens: Address[],
    opts?: PriceFeedsForTokensOptions,
  ) => IPriceFeedContract[];
  /**
   * Converts previously obtained price updates into CreditFacade
   * multicall entries and raw `PriceUpdateV310` structures.
   * @param creditFacade - Address of the credit facade that will receive the multicall.
   * @param updates - Price update result to convert. When omitted, uses latest cached updates.
   **/
  onDemandPriceUpdates: (
    creditFacade: Address,
    updates?: UpdatePriceFeedsResult,
  ) => OnDemandPriceUpdates;
  /**
   * Converts an amount from one token to another using latest known prices.
   * @param from - Source token address.
   * @param to - Destination token address.
   * @param amount - Amount in source-token decimals.
   * @param reserve - Use reserve feeds instead of main.
   **/
  convert: (
    from: Address,
    to: Address,
    amount: bigint,
    reserve?: boolean,
  ) => bigint;
  /**
   * Converts a token amount to its USD value using latest known prices.
   * @param from - Token address.
   * @param amount - Amount in token decimals.
   * @param reserve - Use reserve feeds instead of main.
   **/
  convertToUSD: (from: Address, amount: bigint, reserve?: boolean) => bigint;
  /**
   * Converts a USD amount to a token amount using latest known prices.
   * @param to - Token address.
   * @param amount - Amount in USD (8 decimals).
   * @param reserve - Use reserve feeds instead of main.
   **/
  convertFromUSD: (to: Address, amount: bigint, reserve?: boolean) => bigint;
  /**
   * @internal
   **/
  watchAddresses: Set<Address>;
  /**
   * Returns a human-readable snapshot of the oracle state.
   * @param raw - When `true`, includes raw/unformatted values.
   **/
  stateHuman: (raw?: boolean) => PriceOracleStateHuman;
}
