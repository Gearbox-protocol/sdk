import type { GearboxSDK } from "../GearboxSDK.js";
import type { BaseContractOptions } from "./BaseContract.js";
import { BaseContract } from "./BaseContract.js";

const abi = [] as unknown[];
type abi = typeof abi;

export class PlaceholderContract extends BaseContract<abi> {
  constructor(sdk: GearboxSDK, args: Omit<BaseContractOptions<abi>, "abi">) {
    super(sdk, { ...args, abi });
  }
}
