import type { Address } from "viem";
import type {
  Amount,
  PriceFeedData,
  PriceFeedSummary,
  TokenAmount,
} from "../../../model/index.js";
import type {
  CreditAccountTokensSlice,
  IBaseContract,
} from "../../base/index.js";
import type { PriceOracleStateHuman } from "../../types/index.js";
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
 * Filter and extra inputs controlling which feeds to update for a credit
 * account.
 **/
export interface PriceFeedsForAccountOptions
  extends PriceFeedsForTokensOptions {
  /**
   * Extra tokens to price alongside the account's underlying and its enabled
   * non-dust balances.
   **/
  extraTokens?: Address[];
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
   * Generates the price feed update transactions an account needs to be
   * valued: one per feed of its underlying, of every enabled token it holds a
   * non-dust balance of, and of any `extraTokens`.
   * @param account - Account whose tokens to cover.
   * @param opts - Feed type filter and extra tokens to price.
   **/
  priceUpdateTxsForAccount: (
    account: CreditAccountTokensSlice,
    opts?: PriceFeedsForAccountOptions,
  ) => Promise<UpdatePriceFeedsResult>;
  /**
   * Same as {@link priceUpdateTxsForAccount}, but returns raw price update
   * structures instead of transactions.
   * @param account - Account whose tokens to cover.
   * @param opts - Feed type filter and extra tokens to price.
   **/
  priceUpdatesForAccount: (
    account: CreditAccountTokensSlice,
    opts?: PriceFeedsForAccountOptions,
  ) => Promise<PriceUpdate[]>;
  /**
   * Raw price update structures for the feeds of the given tokens.
   * @param tokens - Token addresses to price.
   * @param opts - Feed type filter.
   **/
  priceUpdatesForTokens: (
    tokens: Address[],
    opts?: PriceFeedsForTokensOptions,
  ) => Promise<PriceUpdate[]>;
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
   * USD value of a token amount as the read model expresses it: plain dollars
   * rather than {@link convertToUSD}'s 8-decimal fixed point, and `null`
   * instead of a throw when the token cannot be priced.
   *
   * A dead or not-yet-updated feed must degrade one field, not fail a whole
   * list, which is why {@link Amount.valueUsd} is nullable.
   *
   * @param token - Token address.
   * @param amount - Amount in token decimals.
   **/
  safeUsdValue: (token: Address, amount: bigint) => number | null;
  /**
   * Pairs a token amount with its USD value, using {@link safeUsdValue}.
   * Syntactic sugar for high-level sdk.
   * @param token - Token address.
   * @param value - Amount in token decimals.
   **/
  toAmount: (token: Address, value: bigint) => Amount;
  /**
   * Like {@link toAmount}, but also names the token, for the fields where the
   * owning group does not.
   * Syntactic sugar for high-level sdk.
   * @param token - Token address.
   * @param value - Amount in token decimals.
   * @throws If the token is not in the registry.
   **/
  toTokenAmount: (token: Address, value: bigint) => TokenAmount;
  /**
   * Describes a token's main price feed and everything it reads from.
   * Reserve feeds are not included.
   * @param token - Token address.
   * @throws If the token has no main feed in this oracle.
   **/
  priceFeedData: (token: Address) => PriceFeedData;
  /**
   * Prices and feeds of a collateral token against an underlying, i.e.
   * everything a liquidation-price chart needs.
   * @param underlying - Token the collateral is priced against.
   * @param collateral - Token being priced.
   * @throws If either token has no main feed in this oracle.
   **/
  priceFeedSummary: (
    underlying: Address,
    collateral: Address,
  ) => PriceFeedSummary;
  /**
   * Unlike {@link convert}, this method will update the price feeds before converting,
   * and conversion will be peformed onchain using main price feeds
   * @param from
   * @param to
   * @param amount
   * @returns
   */
  updateAndConvert: (
    from: Address,
    to: Address,
    amount: bigint,
  ) => Promise<bigint>;
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
