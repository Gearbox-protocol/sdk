import { decimals, getTokenSymbol } from "@gearbox-protocol/sdk-gov";

import { poolQuotaKeeperV3Abi } from "../abi";
import { BaseContract } from "../base";
import type { PoolQuotaKeeperStruct, PoolStruct } from "../base/types";
import type { GearboxSDK } from "../GearboxSDK";
import type { PoolQuotaKeeperState } from "../state/poolState";

type abi = typeof poolQuotaKeeperV3Abi;

export class PoolQuotaKeeperContract extends BaseContract<abi> {
  decimals: number;
  state: PoolQuotaKeeperState;

  constructor(pool: PoolStruct, pqk: PoolQuotaKeeperStruct, sdk: GearboxSDK) {
    super({
      address: pqk.baseParams.addr,
      contractType: pqk.baseParams.contractType,
      version: Number(pqk.baseParams.version),
      name: `PoolQuotaKeeper(${pool.name})`,
      abi: poolQuotaKeeperV3Abi,
      sdk,
    });

    // TODO: avoid reading decimals from sdk-gov
    this.decimals = decimals[getTokenSymbol(pool.underlying)!];

    this.state = {
      address: pqk.baseParams.addr,
      contractType: pqk.baseParams.contractType,
      version: Number(pqk.baseParams.version),
      quotas: Object.fromEntries(
        pqk.quotas.map(q => {
          return [q.token, q];
        }),
      ),
    };
  }
}
