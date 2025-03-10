import { PERCENTAGE_DECIMALS } from "@gearbox-protocol/sdk-gov";
import type { Address } from "viem";

import type {
  GaugeDataPayload,
  GaugeStakingDataPayload,
} from "../payload/gauge";

export class GaugeData {
  readonly address: Address;
  readonly pool: Address;
  readonly poolUnderlying: Address;
  readonly name: string;
  readonly symbol: string;

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
      quotaIncreaseFee: bigint;
      totalQuoted: bigint;
      limit: bigint;
      isActive: boolean;
      stakerVotesLpSide: bigint;
      stakerVotesCaSide: bigint;
    }
  >;

  constructor(payload: GaugeDataPayload) {
    this.address = payload.addr.toLowerCase() as Address;
    this.pool = payload.pool.toLowerCase() as Address;
    this.poolUnderlying = payload.underlying.toLowerCase() as Address;
    this.name = payload.name;
    this.symbol = payload.symbol;

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

          quotaIncreaseFee: BigInt(q.quotaIncreaseFee),
          totalQuoted: q.totalQuoted,
          limit: q.limit,

          totalVotesLpSide: q.totalVotesLpSide,
          totalVotesCaSide: q.totalVotesCaSide,

          stakerVotesLpSide: q.stakerVotesLpSide,
          stakerVotesCaSide: q.stakerVotesCaSide,
        };
        return acc;
      },
      {},
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
  readonly epoch: bigint;

  readonly withdrawableNow: bigint;
  readonly withdrawableInEpochsTotal: bigint;
  readonly withdrawableInEpochs: Array<WithDrawableGaugeItem>;

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
  }
}
