import { toBigInt } from "@gearbox-protocol/sdk-gov";

import { GaugeDataPayload, GaugeQuotaParams } from "../payload/gauge";

export class GaugeData {
  readonly address: string;
  readonly pool: string;
  readonly name: string;
  readonly symbol: string;

  readonly currentEpoch: number;
  readonly epochFrozen: boolean;

  readonly quotaParams: Record<string, GaugeQuotaParams>;

  constructor(payload: GaugeDataPayload) {
    this.address = payload.addr.toLowerCase();
    this.pool = payload.pool.toLowerCase();
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

          rate: q.rate,
          minRate: q.minRate,
          maxRate: q.maxRate,

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
