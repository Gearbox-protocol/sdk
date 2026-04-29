import type { Address } from "viem";

export interface OffchainCuratorMarketConfigurator {
  address: Address;
  chainId: number;
}

export interface OffchainCurator {
  id: string;
  name: string;
  badDebtEvents: number;
  badDebtUsd: number;
  parameterChanges30d: number;
  tvlUsd: number;
  marketConfigurators: OffchainCuratorMarketConfigurator[];
}
