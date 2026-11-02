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
  /**
   * The same, against the market's own underlying: what an account is
   * valued by. A lie that moves collateral and underlying alike leaves it at
   * 1. `null` where either price stopped answering.
   */
  ratioFactor: number | null;
  /** 0 to 10, by {@link scoreOfFactor}. */
  score: number;
}

/**
 * How well one market guards one asset's price, out of 10.
 *
 * Every source group behind the asset's feeds is made, one group at a time,
 * to answer {@link SCORE_MULTIPLIER} times what it answers now. The market
 * scores by the group that moves its final price — `min(main, reserve)` —
 * the furthest.
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
   * The final price is `min(main, reserve)`: a reserve is present, is not a
   * `ZeroPriceFeed`, and answers. Where it is not, the final price is the
   * main feed's alone.
   */
  hasReserve: boolean;
  /** The final price now, in USD. */
  price: number;
  /** Every group behind the two feeds, the most damaging first. */
  impacts: GroupImpact[];
  /** The group the score comes from; `null` where no source feeds the price. */
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
  /** How the market is set up, where that explains its score. */
  notes: string[];
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
