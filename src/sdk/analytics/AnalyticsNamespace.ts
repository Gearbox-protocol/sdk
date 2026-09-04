import type { GearboxAPI } from "../../offchain/index.js";
import type { IAnalytics } from "./types.js";

/** Backend-only protocol analytics exposed by {@link GearboxSDK}. */
export class AnalyticsNamespace implements IAnalytics {
  public readonly positions: GearboxAPI["analytics"]["positions"];

  constructor(backend: GearboxAPI) {
    this.positions = backend.analytics.positions;
  }
}
