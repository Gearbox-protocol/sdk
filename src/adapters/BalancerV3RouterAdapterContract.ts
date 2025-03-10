import type { GearboxSDK } from "../sdk/index.js";
import { iBalancerV3RouterAdapterAbi } from "./abi/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iBalancerV3RouterAdapterAbi;
type abi = typeof abi;

export class BalancerV3RouterAdapterContract extends AbstractAdapterContract<abi> {
  constructor(
    sdk: GearboxSDK,
    args: Omit<AbstractAdapterContractOptions<abi>, "abi">,
  ) {
    super(sdk, {
      ...args,
      abi,
    });
  }
}
