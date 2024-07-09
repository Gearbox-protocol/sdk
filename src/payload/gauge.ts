import { Address } from "viem";

export interface GaugeQuotaParams {
  token: Address;
  minRate: number;
  maxRate: number;
  totalVotesLpSide: bigint;
  totalVotesCaSide: bigint;
  rate: number;
  quotaIncreaseFee: number;
  totalQuoted: bigint;
  limit: bigint;
  isActive: boolean;
  stakerVotesLpSide: bigint;
  stakerVotesCaSide: bigint;
}

export interface GaugeDataPayload {
  addr: Address;
  pool: Address;
  symbol: string;
  name: string;
  underlying: Address;
  currentEpoch: number;
  epochFrozen: boolean;
  quotaParams: readonly GaugeQuotaParams[];
}

export interface GaugeStakingDataPayload {
  availableBalance: bigint;
  totalBalance: bigint;
  epoch: number;
  withdrawableAmounts: {
    withdrawableNow: bigint;
    withdrawableInEpochs: readonly [bigint, bigint, bigint, bigint];
  };
}
