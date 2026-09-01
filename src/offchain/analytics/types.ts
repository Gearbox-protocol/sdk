import type {
  AnalyticsPositionListOptions,
  AnalyticsPositionPage,
} from "../../model/analytics.js";
import type { DataResponse } from "../../model/response.js";

/** Protocol-wide position reads served by the backend. */
export interface IOffchainAnalyticsPositions {
  /**
   * Every current position in the protocol, with its owning borrower, after
   * applying the requested filter, ordering and pagination.
   **/
  list(
    options?: AnalyticsPositionListOptions,
  ): Promise<DataResponse<AnalyticsPositionPage>>;
}

/** Backend-only protocol analytics, grouped by subject. */
export interface IOffchainAnalytics {
  readonly positions: IOffchainAnalyticsPositions;
}
