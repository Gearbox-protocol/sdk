import type { BaseContractStateHuman } from "../sdk/index.js";

export interface DegenDistributorsStateHuman extends BaseContractStateHuman {
  pool: string;
}
