import { iBalancerV3WrapperAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { ConstructOptions } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iBalancerV3WrapperAdapterAbi;
type abi = typeof abi;

export class BalancerV3WrapperAdapterContract extends AbstractAdapterContract<abi> {
  public readonly balancerPoolToken: Address;

  constructor(
    options: ConstructOptions,
    args: Omit<AbstractAdapterContractOptions<abi>, "abi">,
  ) {
    super(options, { ...args, abi });

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
