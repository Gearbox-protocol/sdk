import type { Address } from "viem";

import type { BaseContractStateHuman } from "../sdk/index.js";

export interface Pool7DAgoState {
  pool: Address;
  dieselRate: bigint;
}

export interface Pools7DAgoStateHuman extends BaseContractStateHuman {
  dieselRate: bigint;
}
