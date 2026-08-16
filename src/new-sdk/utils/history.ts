import type {
  DataResponse,
  HistoryRange,
  HistorySeries,
} from "../../model/index.js";

/**
 * Reads the charts of one subject, one metric and one range at a time.
 *
 * @typeParam Metric - Metrics the subject has.
 **/
// the constraint is `string` rather than `HistoryMetric`, matching
// `HistorySeries`: opportunities and positions carry their own metric unions,
// and those are free to drift apart
export interface HistoryReader<Metric extends string> {
  /**
   * Historical chart of one metric over one window. A metric the subject does
   * not have is a compile error.
   **/
  chart(
    metric: Metric,
    range: HistoryRange,
  ): Promise<DataResponse<HistorySeries<Metric>>>;
}
