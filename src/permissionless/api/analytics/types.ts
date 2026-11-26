import type { Address } from "viem";
import type { ChartRange } from "../../../model/charts.js";
import type { Timestamp } from "../../../model/primitives.js";

/** One sampled price, in whole US dollars. */
export interface PriceFeedChartPoint {
  timestamp: Timestamp;
  value: number;
}

/**
 * A feed's price over one window, sampled onto an epoch-aligned grid.
 *
 * Only the buckets with an observation are present: a gap is an absent point,
 * never a zero and never a value carried over from a neighbour. The window is
 * echoed back because `max` resolves against the feed's own first observation
 * and is therefore not derivable from the range alone.
 *
 * Deliberately not a {@link ChartBundle}. A bundle carries one series per
 * {@link ChartMetric}, and that union is closed over what the read model
 * charts — a price feed's own price is not one of them, and widening it would
 * reach every chart the protocol serves to add a series only this page draws.
 **/
export interface PriceFeedPriceChart {
  range: ChartRange;
  from: Timestamp;
  to: Timestamp;
  /** Distance between two consecutive buckets. */
  intervalSeconds: number;
  points: PriceFeedChartPoint[];
}

/** Args of {@link PermissionlessAnalytics.priceChart}. */
export interface PriceChartArgs {
  chainId: number;
  address: Address;
  /** Window to cover. The same set every other Gearbox chart offers. */
  range: ChartRange;
}

/**
 * The rate a feed's price grew at between two of its prints, by the same
 * definition the backend's NAV-step collateral APY uses. A print is a stored
 * price that differs from the stored price before it.
 **/
export interface PriceFeedRealizedRate {
  /**
   * Simple annualized growth to the latest print from the newest print at
   * least {@link RealizedRateArgs.minSpanSeconds} before it, as a decimal
   * fraction (`0.05` is 5% a year).
   *
   * `null` when the prints do not qualify: either is missing, the latest is
   * older than {@link RealizedRateArgs.maxPrintGapSeconds}, or the earlier
   * one sits more than that beyond the minimum span.
   **/
  rate: number | null;
}

/** Args of {@link PermissionlessAnalytics.realizedRate}. */
export interface RealizedRateArgs {
  chainId: number;
  address: Address;
  /** Minimum time between the two prints. The backend defaults to 30 days. */
  minSpanSeconds?: number;
  /**
   * Oldest the latest print may be, and the furthest the anchor may sit
   * beyond {@link minSpanSeconds}. The backend defaults to the span.
   **/
  maxPrintGapSeconds?: number;
}
