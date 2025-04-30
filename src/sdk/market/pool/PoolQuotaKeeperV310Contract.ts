import type { ContractEventName, Log } from "viem";

import { iPoolQuotaKeeperV310Abi } from "../../../abi/v310.js";
import type {
  IBaseContract,
  PoolState,
  QuotaKeeperState,
  QuotaState,
} from "../../base/index.js";
import { BaseContract } from "../../base/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { PoolQuotaKeeperStateHuman } from "../../types/index.js";
import { AddressMap, formatBNvalue, percentFmt } from "../../utils/index.js";

const abi = iPoolQuotaKeeperV310Abi;
type abi = typeof abi;

export class PoolQuotaKeeperV310Contract
  extends BaseContract<abi>
  implements IBaseContract
{
  public readonly decimals: number;
  public readonly quotas: AddressMap<QuotaState>;

  constructor(sdk: GearboxSDK, pool: PoolState, pqk: QuotaKeeperState) {
    super(sdk, {
      ...pqk.baseParams,
      name: `PoolQuotaKeeper(${pool.name})`,
      abi,
    });

    this.decimals = pool.decimals;

    this.quotas = new AddressMap(
      pqk.quotas.map(q => {
        return [q.token, q];
      }),
      "quotas",
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
      case "SetGauge":
      case "SetQuotaIncreaseFee":
      case "SetTokenLimit":
      case "UpdateQuota":
      case "UpdateTokenQuotaRate":
        this.dirty = true;
        break;
    }
  }
}
