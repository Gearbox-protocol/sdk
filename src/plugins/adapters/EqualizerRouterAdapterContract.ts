import type { GearboxSDK } from "../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";
import { iEqualizerRouterAdapterAbi } from "./abi/index.js";

const abi = iEqualizerRouterAdapterAbi;
type abi = typeof abi;

export class EqualizerRouterAdapterContract extends AbstractAdapterContract<abi> {
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
