import type { Address } from "viem";

import { formatBNvalue, percentFmt } from "../utils";
import type {
  GaugeState,
  LinearModelState,
  PoolFactoryState,
  PoolQuotaKeeperState,
  PoolState,
} from "./poolState";
import type { BaseContractStateHuman } from "./stateHuman";
import { convertBaseContractState } from "./stateHuman";

export interface CreditManagerDebtParamsHuman {
  borrowed: string;
  limit: string;
  availableToBorrow: string;
}

export interface PoolStateHuman extends BaseContractStateHuman {
  underlying: string;
  symbol: string;
  name: string;
  decimals: number;
  availableLiquidity: string;
  expectedLiquidity: string;
  totalBorrowed: string;
  totalDebtLimit: string;
  creditManagerDebtParams: Record<string, CreditManagerDebtParamsHuman>;
  totalAssets: string;
  totalSupply: string;
  supplyRate: string;
  baseInterestIndex: string;
  baseInterestRate: string;
  withdrawFee: string;
  lastBaseInterestUpdate: string;
  baseInterestIndexLU: string;
  isPaused: boolean;
}

export function convertPoolStateToHuman(
  state: PoolState,
  labelAddress: (address: Address) => string,
  raw = true,
): PoolStateHuman {
  return {
    ...convertBaseContractState(state, labelAddress),
    underlying: labelAddress(state.underlying),
    symbol: state.symbol,
    name: state.name,
    decimals: state.decimals,
    availableLiquidity: formatBNvalue(
      state.availableLiquidity,
      state.decimals,
      2,
      raw,
    ),
    expectedLiquidity: formatBNvalue(
      state.expectedLiquidity,
      state.decimals,
      2,
      raw,
    ),
    totalBorrowed: formatBNvalue(state.totalBorrowed, state.decimals, 2, raw),
    totalDebtLimit: formatBNvalue(state.totalDebtLimit, state.decimals, 2, raw),
    creditManagerDebtParams: Object.fromEntries(
      Object.entries(state.creditManagerDebtParams).map(([cm, params]) => [
        labelAddress(cm as Address),
        {
          borrowed: formatBNvalue(params.borrowed, state.decimals, 2, raw),
          limit: formatBNvalue(params.limit, state.decimals, 2, raw),
          availableToBorrow: formatBNvalue(
            params.availableToBorrow,
            state.decimals,
            2,
            raw,
          ),
        },
      ]),
    ),
    totalAssets: formatBNvalue(state.totalAssets, state.decimals, 2, raw),
    totalSupply: formatBNvalue(state.totalSupply, state.decimals, 2, raw),
    supplyRate: `${formatBNvalue(state.supplyRate, 25, 2, raw)}%`,
    baseInterestIndex: `${formatBNvalue(state.totalSupply, 25, 2, raw)}%`,
    baseInterestRate: `${formatBNvalue(state.totalSupply, 25, 2, raw)}%`,
    withdrawFee: percentFmt(state.withdrawFee),
    lastBaseInterestUpdate: state.lastBaseInterestUpdate.toString(),
    baseInterestIndexLU: state.lastBaseInterestUpdate.toString(),
    isPaused: state.isPaused,
  };
}

export interface QuotaParamsHuman {
  rate: number;
  quotaIncreaseFee: number;
  totalQuoted: string;
  limit: string;
  isActive: boolean;
}

export interface PoolQuotaKeeperStateHuman extends BaseContractStateHuman {
  quotas: Record<Address, QuotaParamsHuman>;
}

export function convertPoolQuotaKeeperStateToHuman(
  state: PoolQuotaKeeperState,
  decimals: number,
  labelAddress: (address: Address) => string,
  raw = true,
): PoolQuotaKeeperStateHuman {
  return {
    ...convertBaseContractState(state, labelAddress),
    quotas: Object.entries(state.quotas).reduce(
      (acc, [address, params]) => ({
        ...acc,
        [address]: {
          rate: percentFmt(params.rate, raw),
          quotaIncreaseFee: percentFmt(params.quotaIncreaseFee, raw),
          totalQuoted: formatBNvalue(params.totalQuoted, decimals, 2, raw),
          limit: formatBNvalue(params.limit, decimals, 2, raw),
          isActive: params.isActive,
        },
      }),
      {},
    ),
  };
}

export interface LinearModelStateHuman extends BaseContractStateHuman {
  U1: string;
  U2: string;
  Rbase: string;
  Rslope1: string;
  Rslope2: string;
  Rslope3: string;
  isBorrowingMoreU2Forbidden: boolean;
}

export function convertLinearModelStateToHuman(
  state: LinearModelState,
  labelAddress: (address: Address) => string,
  raw = true,
): LinearModelStateHuman {
  return {
    ...convertBaseContractState(state, labelAddress),
    U1: percentFmt(state.U1, raw),
    U2: percentFmt(state.U2, raw),
    Rbase: percentFmt(state.Rbase, raw),
    Rslope1: percentFmt(state.Rslope1, raw),
    Rslope2: percentFmt(state.Rslope2, raw),
    Rslope3: percentFmt(state.Rslope3, raw),
    isBorrowingMoreU2Forbidden: state.isBorrowingMoreU2Forbidden,
  };
}

export interface PoolFactoryStateHuman {
  pool: PoolStateHuman;
  poolQuotaKeeper: PoolQuotaKeeperStateHuman;
  linearModel?: LinearModelStateHuman;
  gauge: GaugeStateHuman;
}

export interface GaugeParamsHuman {
  minRate: string;
  maxRate: string;
  totalVotesLpSide: number;
  totalVotesCaSide: number;
  rate: string;
}

export interface GaugeStateHuman extends BaseContractStateHuman {
  currentEpoch: number;
  epochFrozen: boolean;
  quotaParams: Record<Address, GaugeParamsHuman>;
}

export function convertGaugeStateToHuman(
  state: GaugeState,
  labelAddress: (address: Address) => string,
  raw = true,
): GaugeStateHuman {
  return {
    ...convertBaseContractState(state, labelAddress),
    currentEpoch: state.currentEpoch,
    epochFrozen: state.epochFrozen,
    quotaParams: Object.entries(state.quotaParams).reduce(
      (acc, [address, params]) => ({
        ...acc,
        [address]: {
          minRate: percentFmt(params.minRate, raw),
          maxRate: percentFmt(params.maxRate, raw),
          totalVotesLpSide: params.totalVotesLpSide / 1e18,
          totalVotesCaSide: params.totalVotesCaSide / 1e18,
          rate: percentFmt(params.rate, raw),
        },
      }),
      {},
    ),
  };
}

export function convertPoolFactoryStateToHuman(
  state: PoolFactoryState,
  labelAddress: (address: Address) => string,
  raw = true,
): PoolFactoryStateHuman {
  return {
    pool: convertPoolStateToHuman(state.pool, labelAddress, raw),
    poolQuotaKeeper: convertPoolQuotaKeeperStateToHuman(
      state.poolQuotaKeeper,
      state.pool.decimals,
      labelAddress,
      raw,
    ),

    linearModel: state.linearModel
      ? convertLinearModelStateToHuman(state.linearModel, labelAddress, raw)
      : undefined,
    gauge: convertGaugeStateToHuman(state.gauge, labelAddress, raw),
  };
}
