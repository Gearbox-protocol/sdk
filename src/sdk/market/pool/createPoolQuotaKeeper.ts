import type { PoolData, PoolQuotaKeeperData } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import { PoolQuotaKeeperV300Contract } from "./PoolQuotaKeeperV300Contract";

// TODO: return interface or base contract class
export default function createPoolQuotaKeeper(
  sdk: GearboxSDK,
  pool: PoolData,
  pqk: PoolQuotaKeeperData,
): PoolQuotaKeeperV300Contract {
  const v = pqk.baseParams.version;
  if (v >= 300n && v < 310n) {
    return new PoolQuotaKeeperV300Contract(sdk, pool, pqk);
  }
  throw new Error(`Unsupported pool quota keeper version ${v}`);
}
