import { decimals, getTokenSymbol } from "@gearbox-protocol/sdk-gov";

import { poolQuotaKeeperV3Abi } from "../abi";
import { BaseContract } from "../base";
import type { PoolData, PoolQuotaKeeperData } from "../base/types";
import type { GearboxSDK } from "../GearboxSDK";
import type { PoolQuotaKeeperState } from "../state/poolState";

type abi = typeof poolQuotaKeeperV3Abi;

export class PoolQuotaKeeperContract extends BaseContract<abi> {
  decimals: number;
  state: PoolQuotaKeeperState;

  constructor(sdk: GearboxSDK, pool: PoolData, pqk: PoolQuotaKeeperData) {
    super(sdk, {
      ...pqk.baseParams,
      name: `PoolQuotaKeeper(${pool.name})`,
      abi: poolQuotaKeeperV3Abi,
    });

    // TODO: avoid reading decimals from sdk-gov
    this.decimals = decimals[getTokenSymbol(pool.underlying)!];

    this.state = {
      ...this.contractData,
      quotas: Object.fromEntries(
        pqk.quotas.map(q => {
          return [q.token, q];
        }),
      ),
    };
  }
}
