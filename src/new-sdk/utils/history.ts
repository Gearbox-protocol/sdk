import type {
  HistoryChartMetadata,
  HistoryMetric,
  HistoryPoint,
  HistoryRange,
} from "../../model/index.js";
import type { SourceMeta } from "../types.js";

/**
 * Everything that annotates a chart: what the backend said about the series,
 * plus which sources produced it.
 **/
export interface ChartMetadata extends HistoryChartMetadata {
  /**
   * Which sources answered, see {@link SourceMeta}. A chart is backend-only,
   * so this reports the backend alone.
   **/
  source: SourceMeta;
}

/**
 * One chart: the points to draw and everything that annotates them.
 **/
export interface Chart {
  /**
   * Samples, oldest first.
   **/
  data: HistoryPoint[];
  /**
   * Annotations of the series, see {@link ChartMetadata}.
   **/
  metadata: ChartMetadata;
}

/**
 * Reads the charts of one subject, one metric and one range at a time.
 *
 * @typeParam Metric - Metrics the subject has.
 **/
export interface HistoryReader<Metric extends HistoryMetric> {
  /**
   * Historical chart of one metric over one window.
   *
   * A metric the subject does not have is a compile error rather than an empty
   * chart.
   **/
  chart(metric: Metric, range: HistoryRange): Promise<Chart>;
}
