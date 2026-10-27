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
  /**
   * The market's own name, which is the name of its pool token — what the rest
   * of the backend calls a market by as well.
   */
  marketName: string | null;
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
  /**
   * How much of {@link quotaLimit} the market's borrowers have actually taken,
   * in the same units.
   *
   * The sum of every open credit account's current quota for this token across
   * the credit managers borrowing from the market, so it is what the token is
   * backing right now rather than what it is allowed to back.
   *
   * `null` only where {@link quotaLimit} is: a token nobody quotes reads as a
   * zero against a limit, which is a different answer from a token the keeper
   * holds no entry for at all.
   */
  quotaUsed: number | null;
  /**
   * Staleness period this market's own price oracle holds for the slot, in
   * seconds.
   *
   * The market's figure rather than the store's: a curator sets one per slot
   * in their price oracle, and nothing obliges it to agree with the period the
   * PriceFeedStore carries for the feed. A reader comparing the two is
   * comparing two contracts, which is why both are reported.
   *
   * Read off the oracle when the route is answered rather than taken from the
   * index — the slot's period is not indexed — so `null` means the oracle
   * would not answer, not that it holds no period.
   */
  marketStalenessPeriod: number | null;
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
  /**
   * Ordered by curator, then by market, then by role with the main feeds
   * ahead of the reserve ones — the grouping a reader wants, so a caller
   * rendering a table does not have to sort it again.
   */
  markets: PermissionlessPriceFeedMarket[];
}

/**
 * One feed as a market slot holds it.
 *
 * The store's view of the feed and not the feed itself: a market keeps
 * pricing with whatever it was last pointed at, and nothing removes it from a
 * market when the store drops it. {@link inStore} is what tells those apart,
 * and the name survives either way because the store recorded it before.
 **/
export interface PermissionlessAssetMarketFeed {
  address: Address;
  /**
   * Display name the store recorded, or `null` for a feed it never carried —
   * an aggregator a curator pointed a market straight at, say.
   */
  name: string | null;
  /**
   * Whether the PriceFeedStore still carries the feed.
   *
   * `false` is the case worth showing: the market goes on pricing the asset
   * with a feed the store has removed, or never had. Nothing on chain forbids
   * that, which is exactly why it has to be visible.
   */
  inStore: boolean;
}

/**
 * One market that prices an asset, with both of the slots it may fill.
 *
 * A row per market rather than per `(market, role)`: the two roles are two
 * columns of the same market's row, and the quota is the market's whatever
 * feed holds which slot.
 **/
export interface PermissionlessAssetMarket {
  market: Address;
  marketConfigurator: Address;
  /** The configurator's own name, as the backend's sync recorded it. */
  curatorName: string | null;
  /** The market's own name, which is the name of its pool token. */
  marketName: string | null;
  /** The market's underlying, which its quota figures are denominated in. */
  underlyingToken: Address;
  /** `null` for an underlying the backend has no metadata row for. */
  underlyingSymbol: string | null;
  /** The asset is this market's own underlying, so it is not quota-managed. */
  isUnderlying: boolean;
  /**
   * The market has been shut down.
   *
   * Still reported, and still counted in {@link
   * PermissionlessAssetDetails.quotaUsedUsd}: a shut down market carries no
   * new borrowing but its open accounts are quoting all the same.
   */
  isShutdown: boolean;
  /** The feed the market prices the asset with, or `null` if it has none. */
  mainFeed: PermissionlessAssetMarketFeed | null;
  /** The feed the market falls back to, or `null` if it has none. */
  reserveFeed: PermissionlessAssetMarketFeed | null;
  /**
   * What the pool will take of the asset, in units of {@link underlyingToken}.
   *
   * `null` for an asset the quota keeper was never told a limit for, which the
   * market's own underlying always is. A zero is a limit set to zero, and the
   * two are different answers.
   */
  quotaLimit: number | null;
  /** How much of {@link quotaLimit} is actually taken, in the same units. */
  quotaUsed: number | null;
}

/**
 * One asset of the store: what prices it, and what it is used as collateral
 * for.
 *
 * The counterpart of {@link PermissionlessPriceFeedDetails} — the same corner
 * of the chain read from the asset's end instead of the feed's.
 **/
export interface PermissionlessAssetDetails {
  chainId: number;
  asset: PermissionlessPriceFeedAsset;
  /**
   * Feeds the store currently allows for the asset.
   *
   * Only the store's. A feed a market still prices the asset with but the
   * store has dropped is not here — it is on its market's row, flagged.
   */
  priceFeeds: PriceFeed[];
  /** Ordered by curator, then by market. */
  markets: PermissionlessAssetMarket[];
  /**
   * Total quota limit across the markets still running, in USD.
   *
   * In USD and not in token units because there is no token to state it in: a
   * limit is denominated in its own market's underlying, and an asset is
   * routinely collateral in markets underlain by different tokens, so the
   * figures are not comparable until each is priced. Each market's limit is
   * converted at the price that market's own oracle holds for its underlying.
   *
   * Shut down markets are left out — their limits are not borrowable — and so
   * are markets whose underlying could not be priced, which makes this a floor
   * rather than an estimate. `null` when no market contributed at all.
   */
  quotaLimitUsd: number | null;
  /**
   * Total quota actually taken across every market, in USD, converted the same
   * way as {@link quotaLimitUsd}.
   *
   * Every market, including the shut down ones: debt outstanding is exposure
   * whether or not the market still takes new borrowers.
   */
  quotaUsedUsd: number | null;
}

/**
 * What each of one asset's feeds says the asset is worth, and what the market
 * values the asset at through each.
 *
 * Keyed by the lowercased feed address throughout. The asset is the one asked
 * for, so a cap here is that feed's price times the asset's supply — the same
 * figure {@link PermissionlessPriceFeedMarketCaps} answers from the other
 * side, and the reason both exist is that a page shows one row per feed or one
 * row per asset, never the full cross product.
 *
 * `null` is a read that failed, not a zero.
 **/
export interface PermissionlessAssetPrices {
  prices: Record<Address, string | null>;
  marketCaps: Record<Address, string | null>;
  /** When the backend computed the figures; they are read live, not indexed. */
  time: number;
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

/** Args of a read scoped to one asset. */
export interface AssetArgs {
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
