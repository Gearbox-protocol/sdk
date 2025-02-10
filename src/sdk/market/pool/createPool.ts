import type { PoolData } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import { PoolV300Contract } from "./PoolV300Contract";

// TODO: return interface or base contract class
export default function createPool(
  sdk: GearboxSDK,
  data: PoolData,
): PoolV300Contract {
  const v = data.baseParams.version;
  if (v >= 300n && v < 310n) {
    return new PoolV300Contract(sdk, data);
  }
  throw new Error(`Unsupported pool version ${v}`);
}
