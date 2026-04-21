import type { Address } from "viem";

import { isV310 } from "../constants/index.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import { RouterV310Contract } from "./RouterV310Contract.js";
import type { IRouterContract } from "./types.js";

export function createRouter(
  sdk: OnchainSDK,
  address: Address,
  version: number,
): IRouterContract {
  const contract = sdk.getContract<IRouterContract>(address);
  if (contract) {
    return contract;
  }
  if (isV310(version)) {
    return new RouterV310Contract(sdk, address, version);
  }
  throw new Error(`Unsupported router version ${version}`);
}
