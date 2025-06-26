import type { GearboxSDK } from "../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";
import { iCamelotV3AdapterAbi } from "./abi/index.js";

const abi = iCamelotV3AdapterAbi;

export class CamelotV3AdapterContract extends AbstractAdapterContract<
  typeof abi
> {
  constructor(
    sdk: GearboxSDK,
    args: Omit<AbstractAdapterContractOptions<typeof abi>, "abi">,
  ) {
    super(sdk, {
      ...args,
      abi,
    });
  }
}
