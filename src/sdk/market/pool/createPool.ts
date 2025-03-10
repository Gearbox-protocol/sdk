import type { PoolData } from "../../base/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { PoolV300Contract } from "./PoolV300Contract.js";
import { PoolV310Contract } from "./PoolV310Contract.js";
import type { PoolContract } from "./types.js";

export default function createPool(
  sdk: GearboxSDK,
  data: PoolData,
): PoolContract {
  const v = data.baseParams.version;
  if (v >= 300n && v < 310n) {
    return new PoolV300Contract(sdk, data);
  }
  if (v === 310n) {
    return new PoolV310Contract(sdk, data);
  }
  throw new Error(`Unsupported pool version ${v}`);
}
