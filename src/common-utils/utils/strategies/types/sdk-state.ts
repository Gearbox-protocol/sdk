import type { Address } from "viem";

import type { PoolSlice, TokenSlice } from "../strategy-info/types.js";

import type { StrategyCreditManagerView } from "./strategy-data-source.js";

export interface GearboxSDKFullState<CM extends StrategyCreditManagerView> {
  lastSyncBlock?: {
    blockTimestamp_js: number;
  };
  tokens?: {
    tokenDataList?: Record<Address, TokenSlice>;
  };
  creditManagers?: Record<Address, CM>;
  pools?: Record<Address, PoolSlice>;
}

export type GearboxSDKFullStateByChain<CM extends StrategyCreditManagerView> =
  Record<number, GearboxSDKFullState<CM> | undefined>;
