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

/**
 * An asset the PriceFeedStore currently allows one feed to price.
 *
 * Narrower than {@link PermissionlessAsset} on purpose: this hangs off the
 * feed, so listing the feeds allowed for it would just name the feed back.
 **/
export interface PermissionlessPriceFeedAsset {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
}

/**
 * One token a market prices with the feed.
 *
 * A row per `(market, token, role)` rather than per market: the same feed can
 * be the main feed of one token and the reserve feed of another in the very
 * same market, and both are reported.
 **/
export interface PermissionlessPriceFeedMarket {
  market: Address;
  marketConfigurator: Address;
  /** The configurator's own name, as the backend's sync recorded it. */
  curatorName: string | null;
  token: Address;
  /** `null` for a token the backend has no metadata row for. */
  tokenSymbol: string | null;
  /**
   * Symbol of the market's underlying, which is both what the market is
   * pictured by and what its quota limit is denominated in.
   */
  underlyingSymbol: string | null;
  /** The feed is the market's reserve feed for this token, not its main one. */
  reserve: boolean;
  /** The token is the market's underlying. */
  isUnderlying: boolean;
  /**
   * What the pool will take of this token, in units of the market's
   * underlying.
   *
   * `null` for a token the quota keeper was never told a limit for, which the
   * market's own underlying always is — it is not quota-managed. A zero is a
   * limit the curator has actually set to zero, and the two are different
   * answers.
   */
  quotaLimit: number | null;
}

/**
 * One feed of the store, with everywhere the store lets it be used.
 *
 * Feeds a tree carries but the store never added have no identity to report —
 * no status history, hence no name or staleness — so the read throws for them
 * rather than answering a half-filled row.
 **/
export interface PermissionlessPriceFeedDetails {
  chainId: number;
  priceFeed: PriceFeed;
  assets: PermissionlessPriceFeedAsset[];
  markets: PermissionlessPriceFeedMarket[];
}

/**
 * Market caps of one feed's assets, keyed by the lowercased asset address.
 *
 * Scoped to the feed rather than to the chain, which is what
 * {@link PermissionlessOracles.prices} answers. A cap is
 * `price × totalSupply`, so the chain-wide read pays for one `totalSupply` per
 * asset of every market on it; a screen showing one feed's handful of rows
 * should not.
 *
 * `null` for an asset whose price or supply could not be read — not a zero,
 * since an asset nobody could price is not an asset worth nothing.
 */
export interface PermissionlessPriceFeedMarketCaps {
  marketCaps: Record<Address, string | null>;
  /** When the backend computed the figures; they are read live, not indexed. */
  time: number;
}

/** Args of a read scoped to one feed. */
export interface PriceFeedArgs {
  chainId: number;
  address: Address;
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
