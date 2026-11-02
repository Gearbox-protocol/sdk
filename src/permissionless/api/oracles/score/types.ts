import type { Address } from "viem";

/**
 * One of a market's two feeds for a token, as the score reads it.
 **/
export interface ScoredFeed {
  feed: Address;
  /** The store's name for the feed, `null` where it has none. */
  name: string | null;
  /** Gearbox contract type of the feed itself, `""` for one it never deployed. */
  contractType: string;
  /**
   * Every price source beneath the feed, by name: `"Chainlink"`, `"Lido"`, or
   * the description of a source nothing could name.
   */
  sources: string[];
}

/**
 * How well one market guards one asset's price, out of 10.
 *
 * `score = max(0, 10 − 6·(1 − independence) − 5·(1 − bounded))`, rounded down
 * to a half point.
 **/
export interface MarketScore {
  market: Address;
  marketName: string | null;
  marketConfigurator: Address;
  curatorName: string | null;
  main: ScoredFeed;
  /** `null` where the market holds no reserve for the asset at all. */
  reserve: ScoredFeed | null;
  /**
   * The reserve is a second feed: present, not a `ZeroPriceFeed`, and not
   * the main feed again.
   */
  hasReserve: boolean;
  /**
   * The share of the two feeds' sources they do not have in common:
   * `1 − |shared| / |all|`. 1 for feeds with nothing in common, 0 for feeds
   * on the same sources — and 0 where {@link hasReserve} is false.
   */
  independence: number;
  /** Main or reserve is a `BoundedPriceFeed` or a Gearbox LP feed. */
  bounded: boolean;
  /** The sources the two feeds have in common, by name. */
  sharedSources: string[];
  /**
   * The independence counted here rests on a source nothing could name.
   *
   * Such a source counts as its own, so two of them look independent even
   * if one operator stands behind both. The same unnamed source on both
   * sides — the same contract — is still counted as shared.
   */
  unverified: boolean;
  score: number;
  /** What cost the market its points, for a reader to act on. Empty at 10. */
  reasons: string[];
}

/**
 * One asset's score: its worst market's.
 *
 * The minimum, not an average, because the asset is only as well guarded as
 * the most exposed market that accepts it.
 **/
export interface AssetScore {
  chainId: number;
  asset: Address;
  symbol: string | null;
  /**
   * `null` for an asset no running market accepts as collateral: every
   * market has it switched off, or it is only ever a market's underlying.
   */
  score: number | null;
  /** Some market's score rests on a source nothing could name. */
  unverified: boolean;
  /** The market the score comes from. */
  worst: MarketScore | null;
  /** Every running market pricing the asset, worst first. */
  markets: MarketScore[];
}

export interface AssetScoresArgs {
  /** Omitted scores every chain the backend serves markets for. */
  chainId?: number;
}
