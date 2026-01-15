import { isV300, isV310 } from "../constants/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { AbstractPoolService } from "./AbstractPoolService.js";
import { PoolServiceV300 } from "./PoolServiceV300.js";
import { PoolServiceV310 } from "./PoolServiceV310.js";

/**
 * @sdk
 * @version version of desired pool service; either v300 or v310
 * @returns
 */
export function createPoolService(
  sdk: GearboxSDK,
  version: number,
): AbstractPoolService {
  if (isV300(version)) {
    return new PoolServiceV300(sdk, version);
  }
  if (isV310(version)) {
    return new PoolServiceV310(sdk, version);
  }
  throw new Error(`Unsupported Pool Service version ${version}`);
}
