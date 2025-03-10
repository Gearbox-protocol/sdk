import type { GearboxSDK } from "../GearboxSDK";
import type { BaseContractOptions } from "./BaseContract";
import { BaseContract } from "./BaseContract";

const abi = [] as unknown[];
type abi = typeof abi;

export class PlaceholderContract extends BaseContract<abi> {
  constructor(sdk: GearboxSDK, args: Omit<BaseContractOptions<abi>, "abi">) {
    super(sdk, { ...args, abi });
  }
}
