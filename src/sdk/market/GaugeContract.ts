import type { ContractEventName, Log } from "viem";
import { decodeAbiParameters } from "viem";

import { gaugeV3Abi } from "../abi";
import type { PoolData, RateKeeperData } from "../base";
import { BaseContract } from "../base";
import { WAD } from "../constants";
import type { GearboxSDK } from "../GearboxSDK";
import type { GaugeStateHuman } from "../types";
import { AddressMap, percentFmt } from "../utils";

type abi = typeof gaugeV3Abi;

export interface GaugeParams {
  minRate: number;
  maxRate: number;
  totalVotesLpSide: bigint;
  totalVotesCaSide: bigint;
  rate: number;
}

export class GaugeContract extends BaseContract<abi> {
  public readonly quotaParams: AddressMap<GaugeParams>;
  public readonly epochFrozen: boolean;
  public readonly currentEpoch: number;
  public readonly rates: AddressMap<number>;

  constructor(sdk: GearboxSDK, pool: PoolData, gauge: RateKeeperData) {
    super(sdk, {
      ...gauge.baseParams,
      name: `Gauge(${pool.name})`,
      abi: gaugeV3Abi,
    });

    const [_voter, currentEpoch, epochFrozen, gaugeParams] =
      decodeAbiParameters(
        [
          { name: "voter", type: "address" },
          { name: "currentEpoch", type: "uint16" },
          { name: "epochFrozen", type: "bool" },
          {
            name: "quotaParams",
            type: "tuple[]",
            components: [
              { name: "token", type: "address" },
              { name: "minRate", type: "uint16" },
              { name: "maxRate", type: "uint16" },
              { name: "totalVotesLpSide", type: "uint96" },
              { name: "totalVotesCaSide", type: "uint96" },
            ],
          },
        ],
        gauge.baseParams.serializedParams,
      );
    this.epochFrozen = epochFrozen;
    this.currentEpoch = currentEpoch;
    this.rates = new AddressMap(gauge.rates.map(r => [r.token, r.rate]));
    this.quotaParams = new AddressMap();
    for (const g of gaugeParams) {
      this.quotaParams.upsert(g.token, {
        minRate: g.minRate,
        maxRate: g.maxRate,
        totalVotesLpSide: g.totalVotesLpSide,
        totalVotesCaSide: g.totalVotesCaSide,
        rate: this.rates.get(g.token) ?? 0,
      });
    }
  }

  public override processLog(
    log: Log<
      bigint,
      number,
      false,
      undefined,
      undefined,
      abi,
      ContractEventName<abi>
    >,
  ): void {
    switch (log.eventName) {
      case "AddQuotaToken":
      case "NewController":
      case "Paused":
      case "SetFrozenEpoch":
      case "SetQuotaTokenParams":
      case "Unpaused":
      case "Unvote":
      case "UpdateEpoch":
      case "Vote":
        this.dirty = true;
        break;
    }
  }

  public override stateHuman(raw?: boolean): GaugeStateHuman {
    return {
      ...super.stateHuman(raw),
      currentEpoch: Number(this.currentEpoch),
      epochFrozen: this.epochFrozen,
      quotaParams: this.quotaParams.entries().reduce(
        (acc, [address, params]) => ({
          ...acc,
          [address]: {
            minRate: percentFmt(params.minRate, raw),
            maxRate: percentFmt(params.maxRate, raw),
            totalVotesLpSide: params.totalVotesLpSide / WAD,
            totalVotesCaSide: params.totalVotesCaSide / WAD,
            rate: percentFmt(params.rate, raw),
          },
        }),
        {},
      ),
    };
  }
}
