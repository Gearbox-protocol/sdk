import { Address } from "viem";
import { BaseContractState } from "./state";

export interface CreditManagerDebtParams {
  borrowed: bigint;
  limit: bigint;
  availableToBorrow: bigint;
}

export interface PoolState extends BaseContractState {
  underlying: Address;
  symbol: string;
  name: string;
  decimals: number;
  availableLiquidity: bigint;
  expectedLiquidity: bigint;
  totalBorrowed: bigint;
  totalDebtLimit: bigint;
  creditManagerDebtParams: Record<Address, CreditManagerDebtParams>;
  totalAssets: bigint;
  totalSupply: bigint;
  supplyRate: bigint;
  baseInterestIndex: bigint;
  baseInterestRate: bigint;
  withdrawFee: number;
  lastBaseInterestUpdate: number;
  baseInterestIndexLU: bigint;
  isPaused: boolean;
}

export interface QuotaParams {
  rate: number;
  quotaIncreaseFee: number;
  totalQuoted: bigint;
  limit: bigint;
  isActive: boolean;
}

export interface PoolQuotaKeeperState extends BaseContractState {
  quotas: Record<Address, QuotaParams>;
}

export interface LinearModelState extends BaseContractState {
  U1: number;
  U2: number;
  Rbase: number;
  Rslope1: number;
  Rslope2: number;
  Rslope3: number;
  isBorrowingMoreU2Forbidden: boolean;
}

export interface GaugeParams {
  minRate: number;
  maxRate: number;
  totalVotesLpSide: number;
  totalVotesCaSide: number;
  rate: number;
}

export interface GaugeState extends BaseContractState {
  currentEpoch: number;
  epochFrozen: boolean;
  quotaParams: Record<Address, GaugeParams>;
}

export interface PoolFactoryState {
  pool: PoolState;
  poolQuotaKeeper: PoolQuotaKeeperState;
  linearModel: LinearModelState;
  gauge: GaugeState;
}
