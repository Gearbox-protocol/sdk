import type { Address } from "viem";

import type { TokenSlice } from "../strategy-info/types.js";

import type { CreditManagerData_Legacy } from "./credit-manager-data-legacy.js";

export interface GearboxSDKFullState {
  lastSyncBlock?: {
    blockTimestamp_js: number;
  };
  tokens?: {
    tokenDataList?: Record<Address, TokenSlice>;
  };
  creditManagers?: Record<Address, CreditManagerData_Legacy>;
}

export type GearboxSDKFullStateByChain = Record<
  number,
  GearboxSDKFullState | undefined
>;
