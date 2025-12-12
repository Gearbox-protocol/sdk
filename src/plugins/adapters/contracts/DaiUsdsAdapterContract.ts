import { iDaiUsdsAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { ConstructOptions } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iDaiUsdsAdapterAbi;
type abi = typeof abi;

export class DaiUsdsAdapterContract extends AbstractAdapterContract<
  typeof abi
> {
  public readonly dai: Address;
  public readonly usds: Address;

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
        { type: "address", name: "dai" },
        { type: "address", name: "usds" },
      ],
      args.baseParams.serializedParams,
    );

    this.dai = decoded[2];
    this.usds = decoded[3];
  }
}
