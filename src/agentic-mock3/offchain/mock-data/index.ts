import type { OffchainStateSnapshot } from "../types/index.js";
import { CURATORS } from "./curators.js";
import { POOL_OPPORTUNITIES } from "./pool-opportunities.js";
import { STRATEGY_OPPORTUNITIES } from "./strategy-opportunities.js";

export const MOCK_DATA: OffchainStateSnapshot = {
  opportunities: [...POOL_OPPORTUNITIES, ...STRATEGY_OPPORTUNITIES],
  curators: CURATORS,
};
