import { PERCENTAGE_DECIMALS } from "@gearbox-protocol/sdk-gov";

import {
  GaugeDataPayload,
  GaugeQuotaParams,
  GaugeStakingDataPayload,
} from "../payload/gauge";

export class GaugeData {
  readonly address: string;
  readonly pool: string;
  readonly poolUnderlying: string;
  readonly name: string;
  readonly symbol: string;

  readonly currentEpoch: bigint;
  readonly epochFrozen: boolean;

  readonly quotaParams: Record<string, GaugeQuotaParams>;

  constructor(payload: GaugeDataPayload) {
    this.address = payload.addr.toLowerCase();
    this.pool = payload.pool.toLowerCase();
    this.poolUnderlying = payload.underlying.toLowerCase();
    this.name = payload.name;
    this.symbol = payload.symbol;

    this.currentEpoch = payload.currentEpoch;
    this.epochFrozen = payload.epochFrozen;

    this.quotaParams = payload.quotaParams.reduce<
      Record<string, GaugeQuotaParams>
    >((acc, q) => {
      acc[q.token.toLowerCase()] = {
        token: q.token.toLowerCase(),

        isActive: q.isActive,

        rate: q.rate * PERCENTAGE_DECIMALS,
        minRate: q.minRate * PERCENTAGE_DECIMALS,
        maxRate: q.maxRate * PERCENTAGE_DECIMALS,

        quotaIncreaseFee: q.quotaIncreaseFee,
        totalQuoted: q.totalQuoted,
        limit: q.limit,

        totalVotesLpSide: q.totalVotesLpSide,
        totalVotesCaSide: q.totalVotesCaSide,

        stakerVotesLpSide: q.stakerVotesLpSide,
        stakerVotesCaSide: q.stakerVotesCaSide,
      };
      return acc;
    }, {});
  }
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

  constructor(payload: GaugeStakingDataPayload) {
    this.availableBalance = payload.availableBalance;
    this.totalBalance = payload.totalBalance;
    this.epoch = payload.epoch;
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
  }
}
