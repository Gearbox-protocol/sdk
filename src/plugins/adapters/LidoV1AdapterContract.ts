import type { GearboxSDK } from "../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

// TODO: Add ABI import when available
// import { iLidoV1AdapterAbi } from "./abi/index.js";
// const abi = iLidoV1AdapterAbi;

const abi = [] as const; // Placeholder until ABI is available

export class LidoV1AdapterContract extends AbstractAdapterContract<typeof abi> {
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
