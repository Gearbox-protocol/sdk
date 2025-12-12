import { type Address, decodeAbiParameters } from "viem";
import type { ConstructOptions } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

// TODO:
const abi = [] as const;
type abi = typeof abi;

export class MellowDepositQueueAdapterContract extends AbstractAdapterContract<abi> {
  public readonly asset: Address;
  public readonly phantomToken: Address;
  public readonly referral: Address;

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
        { type: "address", name: "asset" },
        { type: "address", name: "phantomToken" },
        { type: "address", name: "referral" },
      ],
      args.baseParams.serializedParams,
    );

    this.asset = decoded[2];
    this.phantomToken = decoded[3];
    this.referral = decoded[4];
  }
}
