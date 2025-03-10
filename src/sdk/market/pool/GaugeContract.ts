import type { ContractEventName, Log } from "viem";
import { decodeAbiParameters } from "viem";

import { iGaugeV300Abi } from "../../../abi/v300.js";
import type { PoolData, RateKeeperData } from "../../base/index.js";
import { BaseContract } from "../../base/index.js";
import { WAD } from "../../constants/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { GaugeStateHuman } from "../../types/index.js";
import { AddressMap, percentFmt } from "../../utils/index.js";
import type { IRateKeeperContract } from "./types.js";

const abi = iGaugeV300Abi;
type abi = typeof abi;

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
      abi: iGaugeV300Abi,
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
      case "SetFrozenEpoch":
      case "SetQuotaTokenParams":
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
