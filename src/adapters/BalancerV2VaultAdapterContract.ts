import type { GearboxSDK } from "../sdk";
import { iBalancerV2VaultAdapterAbi } from "./abi";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter";
import { AbstractAdapterContract } from "./AbstractAdapter";

const abi = iBalancerV2VaultAdapterAbi;
type abi = typeof abi;

export class BalancerV2VaultAdapterContract extends AbstractAdapterContract<abi> {
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
