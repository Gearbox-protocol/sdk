import type { Address } from "../core/index.js";

export interface OffchainPoolData {
  address: Address;
  chainId: number;
  underlying: Address;
  availableLiquidity: bigint;
  supplyApy: number;
  description: string;
}

export interface OffchainMarketData {
  configurator: Address;
  curatorName: string;
  network: string;
  pool: OffchainPoolData;
}

export type OffchainOpportunityType = "pool" | "strategy";

export interface OffchainOpportunityBase {
  id: string;
  chainId: number;
  type: OffchainOpportunityType;
  title: string;
  curatorName: string;
  poolAddress: Address;
  underlying: Address;
  permissionless: boolean;
  kycRequired: boolean;
}

export interface OffchainPoolOpportunity extends OffchainOpportunityBase {
  type: "pool";
  supplyApy: number;
  tvl: number;
  tvlUsd: number;
  utilization: number;
}

export interface OffchainStrategyOpportunity extends OffchainOpportunityBase {
  type: "strategy";
  creditManagerAddress: Address;
  borrowApy: number;
  maxLeverage: number;
  basicApy: number;
  maxLeverageApy: number;
  minDebt: bigint;
  maxDebt: bigint;
}

export type OffchainOpportunity =
  | OffchainPoolOpportunity
  | OffchainStrategyOpportunity;

export interface OffchainMarketConfigurator {
  chainId: number;
  address: Address;
  name: string;
  poolAddresses: Address[];
}

export interface OffchainCurator {
  name: string;
  link: string | null;
  description: string | null;
  marketConfigurators: OffchainMarketConfigurator[];
}

export interface OffchainInitialData {
  markets: OffchainMarketData[];
  opportunities: OffchainOpportunity[];
  curators: OffchainCurator[];
}
