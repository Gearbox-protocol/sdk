import type { Address } from "../core/index.js";

export interface PoolState {
  address: Address;
  underlying: Address;
  availableLiquidity: bigint;
  isPaused: boolean;
  kycRequired: boolean;
}

export interface MarketState {
  configurator: Address;
  pool: PoolState;
}
