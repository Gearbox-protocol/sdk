import type { Address } from "viem";

import { PERCENTAGE_DECIMALS } from "../constants";

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

interface WithDrawableGaugeItem {
  amount: bigint;
  epochsLeft: number;
}

export class GaugeStakingData {
  readonly availableBalance: bigint;
  readonly totalBalance: bigint;
  readonly epoch: bigint;

  readonly withdrawableNow: bigint;
  readonly withdrawableInEpochsTotal: bigint;
  readonly withdrawableInEpochs: Array<WithDrawableGaugeItem>;

  readonly voteParams: Record<Address, GaugeVoteInfo>;

  constructor(payload: GaugeStakingDataPayload) {
    this.availableBalance = payload.availableBalance;
    this.totalBalance = payload.totalBalance;
    this.epoch = BigInt(payload.epoch);
    this.withdrawableNow = payload.withdrawableAmounts.withdrawableNow;

    const { total, list } =
      payload.withdrawableAmounts.withdrawableInEpochs.reduce<{
        total: bigint;
        list: Array<WithDrawableGaugeItem>;
      }>(
        ({ total, list }, a, i) => {
          const bn = a;
          list.push({ amount: bn, epochsLeft: i + 1 });

          return { total: total + bn, list };
        },
        { total: 0n, list: [] },
      );

    this.withdrawableInEpochsTotal = total;
    this.withdrawableInEpochs = list;

    this.voteParams = Object.values(payload.voteParams).reduce<
      GaugeStakingData["voteParams"]
    >((acc, v) => {
      const gaugeLc = v.gauge.toLowerCase() as Address;

      acc[gaugeLc] = {
        gauge: gaugeLc,
        pool: v.pool.toLowerCase() as Address,
        quotaParams: Object.values(v.quotaParams).reduce<
          GaugeVoteInfo["quotaParams"]
        >((acc, q) => {
          const tokenLc = q.token.toLowerCase() as Address;

          acc[tokenLc] = {
            token: tokenLc,
            stakerVotesLpSide: q.stakerVotesLpSide,
            stakerVotesCaSide: q.stakerVotesCaSide,
          };

          return acc;
        }, {}),
      };
      return acc;
    }, {});
  }
}

interface GaugeQuotaParams {
  token: Address;
  minRate: number;
  maxRate: number;
  totalVotesLpSide: bigint;
  totalVotesCaSide: bigint;
  rate: number;
  totalQuoted: bigint;
  limit: bigint;
  isActive: boolean;
}

export interface GaugeDataPayload {
  addr: Address;
  pool: Address;
  name: string;
  underlying: Address;
  currentEpoch: bigint;
  epochFrozen: boolean;
  quotaParams: readonly GaugeQuotaParams[];
}

export class GaugeData {
  readonly address: Address;
  readonly pool: Address;
  readonly poolUnderlying: Address;
  readonly name: string;

  readonly currentEpoch: bigint;
  readonly epochFrozen: boolean;

  readonly quotaParams: Record<
    Address,
    {
      token: Address;
      minRate: bigint;
      maxRate: bigint;
      totalVotesLpSide: bigint;
      totalVotesCaSide: bigint;
      rate: bigint;

      totalQuoted: bigint;
      limit: bigint;
      isActive: boolean;
    }
  >;

  constructor(payload: GaugeDataPayload) {
    this.address = payload.addr.toLowerCase() as Address;
    this.pool = payload.pool.toLowerCase() as Address;
    this.poolUnderlying = payload.underlying.toLowerCase() as Address;
    this.name = payload.name;

    this.currentEpoch = BigInt(payload.currentEpoch);
    this.epochFrozen = payload.epochFrozen;

    this.quotaParams = payload.quotaParams.reduce<GaugeData["quotaParams"]>(
      (acc, q) => {
        const tokenLc = q.token.toLowerCase() as Address;
        acc[tokenLc] = {
          token: tokenLc,

          isActive: q.isActive,

          rate: BigInt(q.rate) * PERCENTAGE_DECIMALS,
          minRate: BigInt(q.minRate) * PERCENTAGE_DECIMALS,
          maxRate: BigInt(q.maxRate) * PERCENTAGE_DECIMALS,

          totalQuoted: q.totalQuoted,
          limit: q.limit,

          totalVotesLpSide: q.totalVotesLpSide,
          totalVotesCaSide: q.totalVotesCaSide,
        };
        return acc;
      },
      {},
    );
  }
}
