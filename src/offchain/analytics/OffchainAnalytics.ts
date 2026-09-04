import type { GearboxAPIOptions } from "../types.js";
import { OffchainAnalyticsPositions } from "./OffchainAnalyticsPositions.js";
import type { IOffchainAnalytics } from "./types.js";

/** Backend-only protocol analytics, grouped by subject. */
export class OffchainAnalytics implements IOffchainAnalytics {
  public readonly positions: OffchainAnalyticsPositions;

  constructor(options: GearboxAPIOptions) {
    this.positions = new OffchainAnalyticsPositions(options);
  }
}
