import type { PoolState, QuotaKeeperState } from "../../base/index.js";
import { isV300, isV310 } from "../../constants/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { PoolQuotaKeeperV300Contract } from "./PoolQuotaKeeperV300Contract.js";
import { PoolQuotaKeeperV310Contract } from "./PoolQuotaKeeperV310Contract.js";
import type { PoolQuotaKeeperContract } from "./types.js";

export default function createPoolQuotaKeeper(
  sdk: GearboxSDK,
  pool: PoolState,
  pqk: QuotaKeeperState,
): PoolQuotaKeeperContract {
  const v = pqk.baseParams.version;
  if (isV300(v)) {
    return new PoolQuotaKeeperV300Contract(sdk, pool, pqk);
  }
  if (isV310(v)) {
    return new PoolQuotaKeeperV310Contract(sdk, pool, pqk);
  }
  throw new Error(`Unsupported pool quota keeper version ${v}`);
}
