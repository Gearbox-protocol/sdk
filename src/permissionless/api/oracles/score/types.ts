import type { Address } from "viem";

/**
 * One of a market's two feeds for a token, as the score reads it.
 **/
export interface ScoredFeed {
  feed: Address;
  /**
   * The store's name for the feed, `null` where it has none or where the
   * feed was named by address alone, as a pair to score is.
   */
  name: string | null;
  /** Gearbox contract type of the feed itself, `""` for one it never deployed. */
  contractType: string;
  /**
   * Every source group beneath the feed: `"Chainlink"`, `"Lido"`, or the
   * description of a source nothing could name.
   */
  sources: string[];
}

/**
 * What one source group, lying, does to the price a market holds for an
 * asset.
 **/
export interface GroupImpact {
  group: string;
  /** The group was recognised rather than inferred from one feed's name. */
  identified: boolean;
  /**
   * The group's sources this market's feeds read, by what they say they are:
   * `"stETH / ETH"`, `"ETH / USD"`.
   */
  feeds: string[];
  /** Which of the market's feeds read the group. */
  reaches: "main" | "reserve" | "both";
  /**
   * The final price under the lie over the final price now, in USD. `null` is
   * a price that stopped answering.
   */
  factor: number | null;
  /** 1 to 10, by {@link scoreOfFactor}; `null` where the price stopped answering. */
  score: number | null;
}

/**
 * How far the price a main and a reserve feed give together can be pushed:
 * their manipulation resistance, from 1 (does not move) to 10 (takes the
 * whole lie).
 *
 * Every source group behind the two feeds is made, one group at a time, to
 * answer {@link SCORE_MULTIPLIER} times what it answers now. The pair scores
 * by the group that moves its final price — `min(main, reserve)` — the
 * furthest, as a multiple either way.
 **/
export interface FeedPairScore {
  main: ScoredFeed;
  /** `null` where there is no reserve at all. */
  reserve: ScoredFeed | null;
  /**
   * The final price is `min(main, reserve)`: a reserve is present, is not a
   * `ZeroPriceFeed`, and answers. Where it is not, the final price is the
   * main feed's alone.
   */
  hasReserve: boolean;
  /** The final price now, in USD. */
  price: number;
  /** Every group behind the two feeds, the most damaging first. */
  impacts: GroupImpact[];
  /** The group the score comes from; `null` where no group moves the price. */
  worst: GroupImpact | null;
  /**
   * The score rests on a source nothing could name.
   *
   * Such a source is a group of its own and is perturbed alone, so where one
   * feed reads it and the other does not, the other is taken to hold — which
   * it would not if one operator stood behind both.
   */
  unverified: boolean;
  score: number;
  /** How the pair is set up, where that explains its score. */
  notes: string[];
}

/** One market's price for one asset, scored as the pair of feeds it holds. */
export interface MarketScore extends FeedPairScore {
  market: Address;
  marketName: string | null;
  marketConfigurator: Address;
  curatorName: string | null;
}

/**
 * One asset's score: its worst market's.
 *
 * The maximum, not an average, because the asset is only as well guarded as
 * the most exposed market that prices it.
 **/
export interface AssetScore {
  chainId: number;
  asset: Address;
  symbol: string | null;
  /** `null` for an asset no running market prices: it is switched off in all. */
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

export interface FeedPairScoreArgs {
  chainId: number;
  main: Address;
  /** Omitted scores the main feed alone, as a market with no reserve. */
  reserve?: Address;
}
