import type { Address } from "viem";
import type { AssetType } from "../../../model/primitives.js";
import type { PriceFeed } from "../../core/index.js";
import type { PermissionlessChain } from "../chains/types.js";

/**
 * What identifies an asset, which is all a feed's own listing of one says.
 *
 * Used on its own where the asset hangs off something else — a feed's assets,
 * say, where listing the feeds allowed for each would only name the feed back.
 **/
export interface PermissionlessPriceFeedAsset {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
}

/**
 * One asset of a chain, with the feeds allowed for it. The backend indexes
 * the chain, so every feed listed here is one the PriceFeedStore carries and
 * allows for the asset.
 **/
export interface PermissionlessAsset extends PermissionlessPriceFeedAsset {
  owner: Address;
  priceFeeds: PriceFeed[];
}

/**
 * The PriceFeedStore of one chain as the backend has indexed it: the assets
 * it prices, the feeds it carries, and which feed is allowed on which asset.
 *
 * A store is a chain's, so it is described by the same fields the chain list
 * answers with, plus what it holds.
 **/
export interface PermissionlessPriceFeedStore extends PermissionlessChain {
  assets: PermissionlessAsset[];
  priceFeeds: PriceFeed[];
}

/**
 * What names a market, whichever side it is being listed from.
 *
 * A feed's markets and an asset's markets are different reads, but what they
 * say about the market is the same: who curates it, what it is denominated in
 * and how much of its quota is taken. Only the thing the row is about differs,
 * which is what each of the two below adds.
 *
 * "This token" throughout means whatever the extending row is about — the
 * token the feed prices, or the asset the market holds as collateral.
 **/
export interface PermissionlessMarket {
  market: Address;
  marketConfigurator: Address;
  /** The configurator's own name, as the backend's sync recorded it. */
  curatorName: string | null;
  /**
   * The market's own name, which is the name of its pool token — what the rest
   * of the backend calls a market by as well.
   */
  marketName: string | null;
  /**
   * Symbol of the market's underlying, which is both what the market is
   * pictured by and what its quota figures are denominated in.
   */
  underlyingSymbol: string | null;
  /** This token is the market's own underlying, so it is not quota-managed. */
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
}

/**
 * One token a market prices with the feed.
 *
 * A row per `(market, token, role)` rather than per market: the same feed can
 * be the main feed of one token and the reserve feed of another in the very
 * same market, and both are reported.
 **/
export interface PermissionlessIndexedPriceFeedMarket
  extends PermissionlessMarket {
  token: Address;
  /** `null` for a token the backend has no metadata row for. */
  tokenSymbol: string | null;
  /** The feed is the market's reserve feed for this token, not its main one. */
  reserve: boolean;
  /**
   * The price oracle holding the slot, which is what the period is read from.
   *
   * The oracle and not the market: a market that has switched oracles has
   * rows under each, and the period lives on whichever one holds the slot now.
   */
  priceOracle: Address;
}

/**
 * The same slot with the period its oracle holds for it.
 *
 * Read off the chain rather than served, because it is not indexed: a
 * curator sets one per slot in their price oracle, and nothing obliges it to
 * agree with the period the PriceFeedStore carries for the feed. A reader
 * comparing the two is comparing two contracts, which is why both are
 * reported.
 **/
export interface PermissionlessPriceFeedMarket
  extends PermissionlessIndexedPriceFeedMarket {
  /**
   * Staleness period this market's own price oracle holds for the slot, in
   * seconds.
   *
   * `null` means the oracle would not answer, or that it names another feed
   * for the slot — in which case the slot has moved on since it was indexed
   * and the period it holds is not this feed's to report.
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
export interface PermissionlessIndexedPriceFeedDetails {
  chainId: number;
  priceFeed: PriceFeed;
  assets: PermissionlessPriceFeedAsset[];
  /**
   * Ordered by curator, then by market, then by role with the main feeds
   * ahead of the reserve ones — the grouping a reader wants, so a caller
   * rendering a table does not have to sort it again.
   */
  markets: PermissionlessIndexedPriceFeedMarket[];
}

/**
 * The same feed with each slot's staleness period read off its oracle.
 **/
export interface PermissionlessPriceFeedDetails
  extends PermissionlessIndexedPriceFeedDetails {
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
export interface PermissionlessAssetMarket extends PermissionlessMarket {
  /** The market's underlying, which its quota figures are denominated in. */
  underlyingToken: Address;
  /**
   * The feed the market prices its own underlying with, which is what converts
   * this row's quota figures. `null` for a market that has no main feed for
   * its underlying, whose figures therefore cannot be converted at all.
   */
  underlyingPriceFeed: Address | null;
  /**
   * The market has been shut down.
   *
   * Still reported, and still counted in {@link
   * PermissionlessQuotaTotals.quotaUsedUsd}: a shut down market carries no
   * new borrowing but its open accounts are quoting all the same.
   */
  isShutdown: boolean;
  /** The feed the market prices the asset with, or `null` if it has none. */
  mainFeed: PermissionlessAssetMarketFeed | null;
  /** The feed the market falls back to, or `null` if it has none. */
  reserveFeed: PermissionlessAssetMarketFeed | null;
}

/**
 * One asset of the store: what prices it, and what it is used as collateral
 * for.
 *
 * The counterpart of {@link PermissionlessPriceFeedDetails} — the same corner
 * of the chain read from the asset's end instead of the feed's.
 **/
export interface PermissionlessIndexedAssetDetails {
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
}

/**
 * The same asset with its quotas totalled, which is what a reader gets.
 *
 * The totals are over the very rows {@link markets} reports, converted at the
 * price each market's own oracle holds for its underlying, so the header and
 * the table under it cannot disagree.
 **/
export interface PermissionlessAssetDetails
  extends PermissionlessIndexedAssetDetails,
    PermissionlessQuotaTotals {}

/**
 * One asset of the PriceFeedStore, with what its markets make of it.
 *
 * Everything a list of assets renders and nothing else: the store's own read
 * carries each asset's feeds too, which is several times this payload and not
 * what a reader scanning for the big positions is looking at.
 *
 * The quota rows are the ones {@link PermissionlessAssetDetails} heads an
 * asset's own page with, off the same query, so the list and the page a row of
 * it opens are totalling the very same figures.
 *
 * What a reader gets is {@link PermissionlessAssetSummary}, this plus what the
 * SDK makes of the asset.
 **/
export interface PermissionlessIndexedAssetSummary {
  chainId: number;
  /** Lowercased, as everything addressed in these payloads is. */
  address: Address;
  symbol: string;
  /**
   * How many markets still running are underlain by this asset.
   *
   * What makes an asset central rather than merely listed: a token several
   * markets borrow against is the one a reader opens the list for. Shut down
   * markets are left out for the reason their limits are — they are no longer
   * a place anything happens.
   */
  underlyingMarketCount: number;
  /**
   * What each market holding the asset has committed to it, unconverted.
   *
   * One entry per market, in that market's own underlying — see
   * {@link PermissionlessAssetQuota}. Totalling them is
   * {@link PermissionlessAssetSummary}'s two USD figures, which is why they
   * are carried rather than summed: the sum needs a price, and a price needs
   * the chain.
   */
  marketQuotas: PermissionlessAssetQuota[];
}

/**
 * One market's commitment to an asset, in that market's own underlying.
 *
 * Unconverted on purpose: a limit is denominated in its market's underlying,
 * and an asset is routinely collateral in markets underlain by different
 * tokens — WETH is collateral in USDC, WETH and wstETH markets at once on
 * mainnet — so the figures are not comparable until each is priced. The feed
 * that prices the underlying is named here so that whoever totals them knows
 * what to ask the chain.
 **/
export interface PermissionlessAssetQuota {
  /**
   * What the pool will take of the asset, in units of the market's underlying.
   *
   * `null` for a token the quota keeper was never told a limit for, which the
   * market's own underlying always is — it is not quota-managed. A zero is a
   * limit the curator has actually set to zero, and the two are different
   * answers.
   */
  quotaLimit: number | null;
  /** How much of that limit is taken, in the same units. */
  quotaUsed: number | null;
  /** The market has been shut down, so its limit is no longer borrowable. */
  isShutdown: boolean;
  /**
   * The feed the market prices its own underlying with.
   *
   * `null` for a market with no main feed for its underlying, whose figures
   * therefore cannot be converted at all.
   */
  underlyingPriceFeed: Address | null;
}

/**
 * Totals of {@link PermissionlessAssetQuota}, converted to USD.
 *
 * Limits count only the markets still running, because a shut down market's
 * limit is not borrowable; what is already quoted counts everywhere, because
 * debt outstanding is exposure either way. A market whose underlying could not
 * be priced is skipped, which makes both figures floors, and `null` is nothing
 * to total rather than a zero.
 **/
export interface PermissionlessQuotaTotals {
  /** Total quota limit across the markets still running, in USD. */
  quotaLimitUsd: number | null;
  /** Total quota actually taken across every market, in USD. */
  quotaUsedUsd: number | null;
}

/**
 * The same asset with what this SDK makes of it.
 *
 * Two things the backend does not answer for. What the asset is comes off this
 * package's curated tables, because a backend consulting them could only
 * answer from whichever version it was built against — a reader on a newer SDK
 * than the deployment it talks to still classifies by the newer tables. The
 * quota totals come off the chain, because converting a market's own
 * denomination needs a price and the chain is where prices are.
 **/
export interface PermissionlessAssetSummary
  extends PermissionlessIndexedAssetSummary,
    PermissionlessQuotaTotals {
  /**
   * What the asset is, where the tables say so.
   *
   * `null` for anything they do not name, which is most of a store: they
   * classify the tokens markets are built on, and a store carries everything
   * those markets will take as collateral. A filter over this sorts the
   * assets worth sorting and leaves the rest in one heap, which is the honest
   * answer rather than a guess from the symbol.
   */
  assetType: AssetType | null;
  /**
   * Whether the asset stands for something outside the chain.
   *
   * A flag rather than a value of {@link assetType}, because the two answer
   * different questions and an asset can be both: a tokenised treasury is a
   * real-world asset and may still be the stable a market is built on. Unlike
   * {@link assetType} there is no third state — the curated list naming it is
   * the whole of what makes an asset one, so not being on it is a real `false`
   * rather than something unknown.
   */
  isRwa: boolean;
}

/**
 * One feed of a chain, named so it can be read alongside another chain's.
 *
 * An address alone does not identify a feed: the same aggregator is deployed
 * to several chains, and reading it on the wrong one answers the wrong price.
 **/
export interface PriceFeedRef {
  chainId: number;
  address: Address;
}

/**
 * The price one feed reports, as {@link PermissionlessOracles.getPrices}
 * answers.
 *
 * `price` is `null` for a feed whose read reverted, which is not a zero, and
 * is in the 8 decimals every Gearbox feed reports.
 **/
export interface PriceFeedPrice extends PriceFeedRef {
  price: bigint | null;
}

/**
 * One asset with the feeds to value it through.
 *
 * The asset's side of {@link PermissionlessOracles.getMarketCap} — the shape a
 * screen showing one asset's feeds asks with.
 **/
export interface AssetCap {
  chainId: number;
  asset: Address;
  priceFeeds: Address[];
}

/**
 * One feed with the assets to value through it.
 *
 * The feed's side of the same call. Both exist because a screen shows one row
 * per feed or one row per asset, never the full cross product.
 **/
export interface FeedCap {
  chainId: number;
  priceFeed: Address;
  assets: Address[];
}

/**
 * What one feed values one asset's supply at, in USD.
 *
 * `price × totalSupply`, as a decimal string: the product of an 8-decimal
 * price and a supply in the asset's own decimals does not fit a JS number
 * without losing the small end of it.
 *
 * `null` for a pair whose price or supply could not be read — not a zero,
 * since an asset nobody could price is not an asset worth nothing.
 **/
export interface MarketCap {
  chainId: number;
  priceFeed: Address;
  asset: Address;
  cap: string | null;
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

/** Args of {@link PermissionlessOracles.assets}. */
export interface AssetsArgs {
  /** Omit for every chain the backend serves. */
  chainId?: number;
}

