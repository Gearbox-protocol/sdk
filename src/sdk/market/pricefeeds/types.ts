import type { Address, Hex, UnionOmit } from "viem";
import type { IBaseContract, PriceFeedAnswer } from "../../base/index.js";
import type {
  IPriceUpdateTx,
  PriceFeedStateHuman,
  RawTx,
} from "../../types/index.js";
import type { PriceFeedRef } from "./PriceFeedRef.js";

/**
 * @internal
 * Indicates whether a price feed is used as the primary ("Main") or
 * fallback ("Reserve") oracle for a token. Gearbox uses dual-oracle
 * pricing to protect against oracle manipulation.
 **/
export type PriceFeedUsageType = "Main" | "Reserve";

/**
 * Discriminator for the various on-chain price feed contract implementations
 * (e.g. Curve LP, Balancer, Pyth, Redstone).
 **/
export type PriceFeedContractType =
  | "PRICE_FEED::BALANCER_STABLE"
  | "PRICE_FEED::BALANCER_WEIGHTED"
  | "PRICE_FEED::BOUNDED"
  | "PRICE_FEED::COMPOSITE"
  | "PRICE_FEED::CONSTANT"
  | "PRICE_FEED::CURVE_CRYPTO"
  | "PRICE_FEED::CURVE_STABLE"
  | "PRICE_FEED::CURVE_USD"
  | "PRICE_FEED::ERC4626"
  | "PRICE_FEED::EXTERNAL"
  | "PRICE_FEED::MELLOW_LRT"
  | "PRICE_FEED::PENDLE_PT_TWAP"
  | "PRICE_FEED::PYTH"
  | "PRICE_FEED::REDSTONE"
  | "PRICE_FEED::WSTETH"
  | "PRICE_FEED::YEARN"
  | "PRICE_FEED::ZERO";

/**
 * Public interface for a single price feed contract.
 *
 * A price feed converts an on-chain or off-chain data source into a
 * USD-denominated price with 8 decimals. Feeds are organized into trees:
 * composite feeds may depend on several underlying feeds.
 **/
export interface IPriceFeedContract extends IBaseContract {
  /**
   * Whether this price feed enforces a lower-bound cap on its answer.
   **/
  readonly hasLowerBoundCap: boolean;
  /**
   * Discriminator identifying gearbox price feed type
   **/
  readonly priceFeedType: PriceFeedContractType;
  /**
   * Number of decimals in the price answer (typically 8).
   **/
  readonly decimals: number;
  /**
   * `true` if the on-chain contract implements `IUpdatablePriceFeed`,
   * meaning its price can be refreshed via an off-chain data push.
   **/
  readonly updatable: boolean;
  /**
   * @internal
   * `true` once the full feed configuration (decimals, skip-check flag,
   * dependencies, etc.) has been loaded. A feed created from base params
   * alone will have `loaded === false`.
   **/
  readonly loaded: boolean;
  /**
   * Latest price answer for this feed.
   **/
  readonly answer: PriceFeedAnswer;
  /**
   * Whether price feed implements its own safety and staleness checks
   **/
  readonly skipCheck: boolean;
  /**
   * Immediate child feeds that this composite feed depends on.
   **/
  readonly underlyingPriceFeeds: readonly PriceFeedRef[];

  /**
   * Replaces the cached answer with a new value.
   * @param answer - New price answer to store.
   **/
  updateAnswer: (answer: PriceFeedAnswer) => void;

  /**
   * Returns a human-readable snapshot of this feed's state.
   * @param raw - When `true`, includes raw/unformatted values.
   **/
  stateHuman: (
    raw?: boolean,
  ) => UnionOmit<PriceFeedStateHuman, "stalenessPeriod">;

  /**
   * Collects all updatable feeds in this feed's dependency tree,
   * including this feed itself when it is updatable.
   **/
  updatableDependencies: () => IUpdatablePriceFeedContract[];
}

/**
 * Extended price feed interface for feeds whose price can be refreshed
 * via an off-chain data push (e.g. Pyth or Redstone feeds).
 **/
export interface IUpdatablePriceFeedContract extends IPriceFeedContract {
  /**
   * Builds a raw transaction that pushes new price data to the on-chain feed.
   * @param data - ABI-encoded update payload.
   **/
  createPriceUpdateTx: (data: `0x${string}`) => RawTx;
}

/**
 * Result of generating price-feed update transactions.
 **/
export interface UpdatePriceFeedsResult {
  /**
   * Transactions that push fresh prices to updatable feeds.
   **/
  txs: IPriceUpdateTx[];
  /**
   * Latest timestamp among all fetched price updates (unix seconds).
   **/
  timestamp: number;
}

/**
 * Pair: updatable price feed address and
 * data can be passed to IUpdatablePriceFeed.updatePrice
 */
export interface PriceUpdate {
  /**
   * IUpdatablePriceFeed contract address
   */
  priceFeed: Address;
  /**
   * Data that can be passed to IUpdatablePriceFeed.updatePrice
   */
  data: Hex;
}
