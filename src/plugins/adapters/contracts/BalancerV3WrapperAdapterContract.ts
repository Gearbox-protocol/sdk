import { type Address, decodeAbiParameters } from "viem";
import type { GearboxSDK } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

// TODO:
const abi = [] as const;
type abi = typeof abi;

export class BalancerV3WrapperAdapterContract extends AbstractAdapterContract<abi> {
  public readonly balancerPoolToken: Address;

  constructor(
    sdk: GearboxSDK,
    args: Omit<AbstractAdapterContractOptions<abi>, "abi">,
  ) {
    super(sdk, { ...args, abi });

    // Decode parameters directly using ABI decoding
    const decoded = decodeAbiParameters(
      [
        { type: "address", name: "creditManager" },
        { type: "address", name: "targetContract" },
        { type: "address", name: "balancerPoolToken" },
      ],
      args.baseParams.serializedParams,
    );

    this.balancerPoolToken = decoded[2];
  }
}
