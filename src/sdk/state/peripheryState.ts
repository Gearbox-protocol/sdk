import type { Address } from "viem";

import type { BaseContractState } from "./state";

export type DataCompressorV3State = BaseContractState;

export type DegenDistributorState = BaseContractState;

export type MultiPauseState = BaseContractState;

export interface ZapperInfo {
  address: Address;
  pool: Address;
  tokenIn: Address;
  tokenOut: Address;
}

export interface ZapperRegisterState extends BaseContractState {
  // mapping pool -> ZapperInfo[]
  zappers: Record<Address, Array<ZapperInfo>>;
}

export interface PeripheryState {
  dataCompressorV3?: DataCompressorV3State;
  degenDistributor?: DegenDistributorState;
  multiPause: MultiPauseState;
  zapperRegister: ZapperRegisterState;
}
