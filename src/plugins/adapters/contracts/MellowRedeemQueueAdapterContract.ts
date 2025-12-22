import { type Address, decodeAbiParameters } from "viem";
import type { ConstructOptions } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

// TODO:
const abi = [] as const;
type abi = typeof abi;

export class MellowRedeemQueueAdapterContract extends AbstractAdapterContract<abi> {
  public readonly vaultToken: Address;
  public readonly phantomToken: Address;

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
        { type: "address", name: "vaultToken" },
        { type: "address", name: "phantomToken" },
      ],
      args.baseParams.serializedParams,
    );

    this.vaultToken = decoded[2];
    this.phantomToken = decoded[3];
  }
}
