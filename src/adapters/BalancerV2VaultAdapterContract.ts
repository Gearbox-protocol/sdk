import type { GearboxSDK } from "../sdk/index.js";
import { iBalancerV2VaultAdapterAbi } from "./abi/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

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
