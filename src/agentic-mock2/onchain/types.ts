import type { Address } from "../core/index.js";

export interface OnchainPoolState {
  address: Address;
  underlying: Address;
  availableLiquidity: bigint;
  isPaused: boolean;
  kycRequired: boolean;
}

export interface OnchainMarketData {
  configurator: Address;
  pool: OnchainPoolState;
}
