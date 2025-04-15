import type { Address } from "abitype";

import type { PriceOracleData } from "../../base/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { PriceOracleV300Contract } from "./PriceOracleV300Contract.js";
import { PriceOracleV310Contract } from "./PriceOracleV310Contract.js";
import type { PriceOracleContract } from "./types.js";

export function createPriceOracle(
  sdk: GearboxSDK,
  data: PriceOracleData,
  underlying: Address,
): PriceOracleContract {
  const v = data.baseParams.version;
  if (v >= 300n && v < 310n) {
    return new PriceOracleV300Contract(sdk, data, underlying);
  }
  if (v === 310n) {
    return new PriceOracleV310Contract(sdk, data, underlying);
  }
  throw new Error(`Unsupported oracle version ${v}`);
}
