import type { BaseContractArgs } from "./BaseContract.js";
import { BaseContract } from "./BaseContract.js";
import type { ConstructOptions } from "./index.js";

const abi = [] as unknown[];
type abi = typeof abi;

export class PlaceholderContract extends BaseContract<abi> {
  constructor(
    options: ConstructOptions,
    args: Omit<BaseContractArgs<abi>, "abi">,
  ) {
    super(options, { ...args, abi });
  }
}
