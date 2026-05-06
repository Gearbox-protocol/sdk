import type { Address } from "viem";

import type { PoolSlice, TokenSlice } from "../strategy-info/types.js";

import type { CreditManagerDataSlice } from "./credit-manager-data-legacy.js";

export interface GearboxSDKFullState<CM extends CreditManagerDataSlice> {
  lastSyncBlock?: {
    blockTimestamp_js: number;
  };
  tokens?: {
    tokenDataList?: Record<Address, TokenSlice>;
  };
  creditManagers?: Record<Address, CM>;
  pools?: Record<Address, PoolSlice>;
}

export type GearboxSDKFullStateByChain<CM extends CreditManagerDataSlice> =
  Record<number, GearboxSDKFullState<CM> | undefined>;
