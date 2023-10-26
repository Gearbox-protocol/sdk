import { PERCENTAGE_DECIMALS, toBigInt } from "@gearbox-protocol/sdk-gov";

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

  readonly currentEpoch: number;
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

    this.quotaParams = Object.fromEntries(
      payload.quotaParams.map((q): [string, GaugeQuotaParams] => [
        q.token.toLowerCase(),
        {
          token: q.token.toLowerCase(),

          isActive: q.isActive,

          rate: Number(toBigInt(q.rate) * PERCENTAGE_DECIMALS),
          minRate: Number(toBigInt(q.minRate) * PERCENTAGE_DECIMALS),
          maxRate: Number(toBigInt(q.maxRate) * PERCENTAGE_DECIMALS),

          quotaIncreaseFee: q.quotaIncreaseFee,
          totalQuoted: toBigInt(q.totalQuoted),
          limit: toBigInt(q.limit),

          totalVotesLpSide: toBigInt(q.totalVotesLpSide),
          totalVotesCaSide: toBigInt(q.totalVotesCaSide),

          stakerVotesLpSide: toBigInt(q.stakerVotesLpSide),
          stakerVotesCaSide: toBigInt(q.stakerVotesCaSide),
        },
      ]),
    );
  }
}

interface WithDrawableGaugeItem {
  amount: bigint;
  epochsLeft: number;
}

export class GaugeStakingData {
  readonly availableBalance: bigint;
  readonly totalBalance: bigint;
  readonly epoch: number;

  readonly withdrawableNow: bigint;
  readonly withdrawableInEpochsTotal: bigint;
  readonly withdrawableInEpochs: Array<WithDrawableGaugeItem>;

  constructor(payload: GaugeStakingDataPayload) {
    this.availableBalance = toBigInt(payload.availableBalance);
    this.totalBalance = toBigInt(payload.totalBalance);
    this.epoch = payload.epoch;
    this.withdrawableNow = toBigInt(
      payload.withdrawableAmounts.withdrawableNow,
    );

    const { total, list } =
      payload.withdrawableAmounts.withdrawableInEpochs.reduce<{
        total: bigint;
        list: Array<WithDrawableGaugeItem>;
      }>(
        ({ total, list }, a, i) => {
          const bn = toBigInt(a);
          list.push({ amount: bn, epochsLeft: i + 1 });

          return { total: total + bn, list };
        },
        { total: 0n, list: [] },
      );

    this.withdrawableInEpochsTotal = total;
    this.withdrawableInEpochs = list;
  }
}
