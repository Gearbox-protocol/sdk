import type { PoolData, PoolQuotaKeeperData } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import { PoolQuotaKeeperV300Contract } from "./PoolQuotaKeeperV300Contract";
import { PoolQuotaKeeperV310Contract } from "./PoolQuotaKeeperV310Contract";
import type { PoolQuotaKeeperContract } from "./types";

export default function createPoolQuotaKeeper(
  sdk: GearboxSDK,
  pool: PoolData,
  pqk: PoolQuotaKeeperData,
): PoolQuotaKeeperContract {
  const v = pqk.baseParams.version;
  if (v >= 300n && v < 310n) {
    return new PoolQuotaKeeperV300Contract(sdk, pool, pqk);
  }
  if (v === 310n) {
    return new PoolQuotaKeeperV310Contract(sdk, pool, pqk);
  }
  throw new Error(`Unsupported pool quota keeper version ${v}`);
}
