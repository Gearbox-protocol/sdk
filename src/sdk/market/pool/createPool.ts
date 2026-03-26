import type { PoolState } from "../../base/index.js";
import { isV310 } from "../../constants/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { PoolV310Contract } from "./PoolV310Contract.js";
import type { PoolContract } from "./types.js";

export default function createPool(
  sdk: GearboxSDK,
  data: PoolState,
): PoolContract {
  const v = data.baseParams.version;
  if (isV310(v)) {
    return new PoolV310Contract(sdk, data);
  }
  throw new Error(`Unsupported pool version ${v}`);
}
