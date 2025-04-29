import type { Address } from "viem";

import type { GearboxSDK } from "../GearboxSDK.js";
import { RouterV300Contract } from "./RouterV300Contract.js";
import { RouterV310Contract } from "./RouterV310Contract.js";
import type { IRouterContract } from "./types.js";

export function createRouter(
  sdk: GearboxSDK,
  address: Address,
  version: number,
): IRouterContract {
  if (version >= 300 && version < 310) {
    return new RouterV300Contract(sdk, address);
  }
  if (version === 310) {
    return new RouterV310Contract(sdk, address);
  }
  throw new Error(`Unsupported router version ${version}`);
}
