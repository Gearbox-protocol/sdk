import type { Address } from "viem";

import { iGearboxRouterV310Abi } from "../../abi/routerV310.js";
import { BaseContract } from "../base/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";

const abi = iGearboxRouterV310Abi;
type abi = typeof abi;

export class RouterV310Contract extends BaseContract<abi> {
  constructor(sdk: GearboxSDK, address: Address) {
    super(sdk, {
      addr: address,
      name: "RouterV300",
      abi,
    });
  }
}
