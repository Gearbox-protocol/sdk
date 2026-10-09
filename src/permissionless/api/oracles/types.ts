import type { Address } from "viem";
import type { PriceFeed } from "../../core/index.js";

/**
 * One asset of a chain, with the feeds allowed for it. The backend indexes
 * the chain, so every feed listed here is one the PriceFeedStore carries and
 * allows for the asset.
 **/
export interface PermissionlessAsset {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  owner: Address;
  priceFeeds: PriceFeed[];
}

/**
 * The PriceFeedStore of one chain as the backend has indexed it: the assets
 * it prices, the feeds it carries, and which feed is allowed on which asset.
 **/
export interface PermissionlessPriceFeedStore {
  chainId: number;
  name: string;
  isPublic: boolean;
  isActivated: boolean;
  explorerUrl: string;
  assets: PermissionlessAsset[];
  priceFeeds: PriceFeed[];
}

/**
 * A price per feed, and a market cap per feed and the asset it prices.
 * `null` is a price the backend could not read, not a zero.
 **/
export interface PermissionlessPrices {
  prices: Record<Address, string | null>;
  marketCaps: Record<Address, Record<Address, string | null>>;
  time: number;
}

/** Args of {@link PermissionlessOracles.getPrices}. */
export interface GetPricesArgs {
  chainId: number;
  /**
   * The feeds to price. Any address answering `latestRoundData` works — the
   * store does not have to carry it, which is the point of reading the chain
   * rather than asking the backend.
   **/
  priceFeeds: Address[];
}
