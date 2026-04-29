import type { OffchainCurator } from "./curators.js";
import type { Opportunity } from "./opportunities.js";

export interface OffchainStateSnapshot {
  opportunities: Opportunity[];
  curators: OffchainCurator[];
}
