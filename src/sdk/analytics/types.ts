import type { IOffchainAnalyticsPositions } from "../../offchain/index.js";

/** Backend-only protocol analytics, grouped by subject. */
export interface IAnalytics {
  readonly positions: IOffchainAnalyticsPositions;
}

/** `sdk.analytics` per mode: absent when the SDK has no backend source. */
export interface IAnalyticsByMode {
  onchain: undefined;
  offchain: IAnalytics;
  both: IAnalytics;
}
