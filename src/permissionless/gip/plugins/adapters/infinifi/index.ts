import type { Address } from "viem";
import type { AdapterActionContext } from "../actions.js";
import type { BaseAdapterState } from "../logic.js";

export type InfinifiLockedTokenStatus = {
  lockedToken: Address;
  unwindingEpochs: number;
  allowed: boolean;
};

export type InfinifiAdapterState = BaseAdapterState & {
  lockedTokens: InfinifiLockedTokenStatus[];
};

export type SetLockedTokenBatchStatusParams = AdapterActionContext & {
  lockedTokens: InfinifiLockedTokenStatus[];
};
