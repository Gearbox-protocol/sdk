import type { Address } from "viem";

interface UserVote {
  token: Address;
  stakerVotesLpSide: bigint;
  stakerVotesCaSide: bigint;
}

interface GaugeVoteInfo {
  pool: Address;
  gauge: Address;
  quotaParams: Record<Address, UserVote>;
}

export interface GaugeStakingDataPayload {
  availableBalance: bigint;
  totalBalance: bigint;
  epoch: number;
  withdrawableAmounts: {
    withdrawableNow: bigint;
    withdrawableInEpochs: readonly [bigint, bigint, bigint, bigint];
  };

  voteParams: Record<Address, GaugeVoteInfo>;
}
