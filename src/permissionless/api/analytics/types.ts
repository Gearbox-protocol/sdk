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
