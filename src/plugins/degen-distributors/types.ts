import type { BaseContractStateHuman } from "../../onchain/index.js";

export interface DegenDistributorsStateHuman extends BaseContractStateHuman {
  pool: string;
}
