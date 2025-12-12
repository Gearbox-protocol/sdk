import type { Address } from "viem";

import { isV300, isV310 } from "../constants/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import { RouterV300Contract } from "./RouterV300Contract.js";
import { RouterV310Contract } from "./RouterV310Contract.js";
import type { IRouterContract } from "./types.js";

export function createRouter(
  sdk: GearboxSDK,
  address: Address,
  version: number,
): IRouterContract {
  const contract = sdk.getContract<IRouterContract>(address);
  if (contract) {
    return contract;
  }
  if (isV300(version)) {
    return new RouterV300Contract(sdk, address, version);
  }
  if (isV310(version)) {
    return new RouterV310Contract(sdk, address, version);
  }
  throw new Error(`Unsupported router version ${version}`);
}
