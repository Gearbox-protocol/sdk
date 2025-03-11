import { AP_ROUTER } from "../constants/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import { RouterV300Contract } from "./RouterV300Contract.js";

export function createRouter(sdk: GearboxSDK): RouterV300Contract {
  const [address, v] = sdk.addressProvider.getLatestVersion(AP_ROUTER);
  if (v >= 300 && v < 310) {
    return new RouterV300Contract(sdk, address);
  }
  // if (v === 310) {
  // return new RouterV310Contract(sdk, address);
  // }
  throw new Error(`Unsupported router version ${v}`);
}
