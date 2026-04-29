import type { Address } from "../core/index.js";

export interface OffchainPoolData {
  address: Address;
  chainId: number;
  underlying: Address;
  availableLiquidity: bigint;
  apy: number;
  description: string;
}

export interface OffchainMarketData {
  configurator: Address;
  pool: OffchainPoolData;
}
