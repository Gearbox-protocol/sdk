import type {
  DataResponse,
  HistoryRange,
  HistorySeries,
} from "../../model/index.js";

/**
 * Reads the charts of one subject, one metric and one range at a time.
 *
 * The constraint is `string` rather than {@link HistoryMetric}, matching
 * {@link HistorySeries}: opportunities and positions carry their own metric
 * unions, and those are free to drift apart.
 *
 * @typeParam Metric - Metrics the subject has.
 **/
export interface HistoryReader<Metric extends string> {
  /**
   * Historical chart of one metric over one window.
   *
   * A metric the subject does not have is a compile error rather than an empty
   * chart. The series arrives in the same envelope as every other read, whose
   * metadata names the one chain the subject lives on and the block the backend
   * has indexed it to.
   **/
  chart(
    metric: Metric,
    range: HistoryRange,
  ): Promise<DataResponse<HistorySeries<Metric>>>;
}
