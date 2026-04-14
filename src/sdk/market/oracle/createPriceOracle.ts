import type { PriceOracleData } from "../../base/index.js";
import { isV310 } from "../../constants/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { PriceOracleV310Contract } from "./PriceOracleV310Contract.js";
import type { IPriceOracleContract } from "./types.js";

export function createPriceOracle(
  sdk: OnchainSDK,
  data: PriceOracleData,
): IPriceOracleContract {
  const { version } = data.baseParams;

  if (isV310(version)) {
    return new PriceOracleV310Contract(sdk, data);
  }
  throw new Error(`Unsupported oracle version ${version}`);
}
