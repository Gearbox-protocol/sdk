import type { GearboxSDK } from "../sdk";
import { iYearnV2AdapterAbi } from "./abi";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter";
import { AbstractAdapterContract } from "./AbstractAdapter";

const abi = iYearnV2AdapterAbi;

export class YearnV2RouterAdapterContract extends AbstractAdapterContract<
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
