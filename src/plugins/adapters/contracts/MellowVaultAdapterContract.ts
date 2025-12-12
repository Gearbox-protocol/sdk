import { iMellowVaultAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { ConstructOptions } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iMellowVaultAdapterAbi;
type abi = typeof abi;

export class MellowVaultAdapterContract extends AbstractAdapterContract<abi> {
  public readonly allowedUnderlyings: Address[];

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
        { type: "address[]", name: "allowedUnderlyings" },
      ],
      args.baseParams.serializedParams,
    );

    this.allowedUnderlyings = [...decoded[2]];
  }
}
