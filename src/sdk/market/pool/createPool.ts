import type { PoolData } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import { PoolV300Contract } from "./PoolV300Contract";
import { PoolV310Contract } from "./PoolV310Contract";
import type { PoolContract } from "./types";

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
