import { AP_ROUTER } from "../constants/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import { RouterV300Contract } from "./RouterV300Contract.js";
import { RouterV310Contract } from "./RouterV310Contract.js";
import type { IRouterContract } from "./types.js";

export function createRouter(sdk: GearboxSDK): IRouterContract {
  const [address, v] = sdk.addressProvider.getLatestVersion(AP_ROUTER);
  if (v >= 300 && v < 310) {
    return new RouterV300Contract(sdk, address);
  }
  if (v === 310) {
    return new RouterV310Contract(sdk, address);
  }
  throw new Error(`Unsupported router version ${v}`);
}
