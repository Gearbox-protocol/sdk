import type { GearboxSDK } from "../sdk";
import { iBalancerV3RouterAdapterAbi } from "./abi";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter";
import { AbstractAdapterContract } from "./AbstractAdapter";

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
