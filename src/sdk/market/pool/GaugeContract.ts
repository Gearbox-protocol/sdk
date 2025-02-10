import type { ContractEventName, Log } from "viem";
import { decodeAbiParameters } from "viem";

import { gaugeV3Abi } from "../../abi";
import type { PoolData, RateKeeperData } from "../../base";
import { BaseContract } from "../../base";
import { WAD } from "../../constants";
import type { GearboxSDK } from "../../GearboxSDK";
import type { GaugeStateHuman } from "../../types";
import { AddressMap, percentFmt } from "../../utils";
import type { IRateKeeperContract } from "./types";

type abi = typeof gaugeV3Abi;

export interface GaugeParams {
  minRate: number;
  maxRate: number;
  totalVotesLpSide: bigint;
  totalVotesCaSide: bigint;
  rate: number;
}

export class GaugeContract
  extends BaseContract<abi>
  implements IRateKeeperContract
{
  public readonly quotaParams: AddressMap<GaugeParams>;
  public readonly epochFrozen: boolean;
  public readonly epochLastUpdate: number;
  public readonly rates: AddressMap<number>;

  constructor(sdk: GearboxSDK, pool: PoolData, gauge: RateKeeperData) {
    super(sdk, {
      ...gauge.baseParams,
      name: `Gauge(${pool.name})`,
      abi: gaugeV3Abi,
    });

    const [_voter, epochLastUpdate, epochFrozen, gaugeTokens, gaugeParams] =
      decodeAbiParameters(
        [
          { name: "voter", type: "address" },
          { name: "epochLastUpdate", type: "uint16" },
          { name: "epochFrozen", type: "bool" },
          { name: "tokens", type: "address[]" },
          {
            name: "quotaParams",
            type: "tuple[]",
            components: [
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
    this.epochLastUpdate = epochLastUpdate;
    this.rates = new AddressMap(gauge.rates.map(r => [r.token, r.rate]));
    this.quotaParams = new AddressMap();
    for (let i = 0; i < gaugeParams.length; i++) {
      const token = gaugeTokens[i];
      const params = gaugeParams[i];
      this.quotaParams.upsert(token, {
        minRate: params.minRate,
        maxRate: params.maxRate,
        totalVotesLpSide: params.totalVotesLpSide,
        totalVotesCaSide: params.totalVotesCaSide,
        rate: this.rates.get(token) ?? 0,
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
      epochLastUpdate: Number(this.epochLastUpdate),
      epochFrozen: this.epochFrozen,
      quotaParams: this.quotaParams.entries().reduce(
        (acc, [address, params]) => ({
          ...acc,
          [this.labelAddress(address)]: {
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
