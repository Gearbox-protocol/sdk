import type { ContractEventName, Log } from "viem";

import { poolQuotaKeeperV3Abi } from "../../abi";
import type {
  IBaseContract,
  PoolData,
  PoolQuotaKeeperData,
  QuotaState,
} from "../../base";
import { BaseContract } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import type { PoolQuotaKeeperStateHuman } from "../../types";
import { AddressMap, formatBNvalue, percentFmt } from "../../utils";

type abi = typeof poolQuotaKeeperV3Abi;

export class PoolQuotaKeeperV300Contract
  extends BaseContract<abi>
  implements IBaseContract
{
  public readonly decimals: number;
  public readonly quotas: AddressMap<QuotaState>;

  constructor(sdk: GearboxSDK, pool: PoolData, pqk: PoolQuotaKeeperData) {
    super(sdk, {
      ...pqk.baseParams,
      name: `PoolQuotaKeeper(${pool.name})`,
      abi: poolQuotaKeeperV3Abi,
    });

    this.decimals = pool.decimals;

    this.quotas = new AddressMap(
      pqk.quotas.map(q => {
        return [q.token, q];
      }),
    );
  }

  public override stateHuman(raw = true): PoolQuotaKeeperStateHuman {
    return {
      ...super.stateHuman(raw),
      quotas: this.quotas.entries().reduce(
        (acc, [address, params]) => ({
          ...acc,
          [this.labelAddress(address)]: {
            rate: percentFmt(params.rate, raw),
            quotaIncreaseFee: percentFmt(params.quotaIncreaseFee, raw),
            totalQuoted: formatBNvalue(
              params.totalQuoted,
              this.decimals,
              2,
              raw,
            ),
            limit: formatBNvalue(params.limit, this.decimals, 2, raw),
            isActive: params.isActive,
          },
        }),
        {},
      ),
    };
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
      case "AddCreditManager":
      case "AddQuotaToken":
      case "NewController":
      case "Paused":
      case "SetGauge":
      case "SetQuotaIncreaseFee":
      case "SetTokenLimit":
      case "Unpaused":
      case "UpdateQuota":
      case "UpdateTokenQuotaRate":
        this.dirty = true;
        break;
    }
  }
}
