import type { HistoryRange, HistorySeries } from "../../model/index.js";
import type { ReadResult } from "../types.js";

/**
 * One method per metric, each reading that metric's series for a range.
 *
 * @typeParam Metric - Metrics the subject has.
 **/
export type HistoryMethods<Metric extends string> = {
  [M in Metric]: (range: HistoryRange) => Promise<ReadResult<HistorySeries<M>>>;
};

/**
 * How a namespace reads one series, given the metric the caller named.
 *
 * @typeParam Metric - Metrics the subject has.
 **/
export type FetchHistorySeries<Metric extends string> = (
  metric: Metric,
  range: HistoryRange,
) => Promise<ReadResult<HistorySeries<Metric>>>;

/**
 * Builds the {@link HistoryMethods} bag of a subject from its metric list.
 *
 * @typeParam Metric - Metrics the subject has.
 * @param metrics - Metrics to expose, one method each.
 * @param fetch - Reads one series, see {@link FetchHistorySeries}.
 **/
export function createHistoryMethods<Metric extends string>(
  metrics: readonly Metric[],
  fetch: FetchHistorySeries<Metric>,
): HistoryMethods<Metric> {
  return Object.fromEntries(
    metrics.map(metric => [
      metric,
      (range: HistoryRange) => fetch(metric, range),
    ]),
  ) as HistoryMethods<Metric>;
}
