import { iMellowWrapperAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { ConstructOptions } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iMellowWrapperAdapterAbi;
type abi = typeof abi;

export class MellowWrapperAdapterContract extends AbstractAdapterContract<abi> {
  public readonly allowedVaults: Address[];

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
        { type: "address[]", name: "allowedVaults" },
      ],
      args.baseParams.serializedParams,
    );

    this.allowedVaults = [...decoded[2]];
  }
}
