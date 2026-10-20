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
  token: Address;
  /** `null` for a token the backend has no metadata row for. */
  tokenSymbol: string | null;
  /** The feed is the market's reserve feed for this token, not its main one. */
  reserve: boolean;
  /** The token is the market's underlying. */
  isUnderlying: boolean;
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
