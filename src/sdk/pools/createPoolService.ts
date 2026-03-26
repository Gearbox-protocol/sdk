import { isV310 } from "../constants/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { AbstractPoolService } from "./AbstractPoolService.js";
import { PoolServiceV310 } from "./PoolServiceV310.js";

export function createPoolService(
  sdk: GearboxSDK,
  version: number,
): AbstractPoolService {
  if (isV310(version)) {
    return new PoolServiceV310(sdk, version);
  }
  throw new Error(`Unsupported Pool Service version ${version}`);
}
