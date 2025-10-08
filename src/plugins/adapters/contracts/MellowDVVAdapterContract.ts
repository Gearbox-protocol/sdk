import { mellowDvvAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { GearboxSDK } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = mellowDvvAdapterAbi;
type abi = typeof abi;

export class MellowDVVAdapterContract extends AbstractAdapterContract<abi> {
  public readonly vault: Address;
  public readonly asset: Address;

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
        { type: "address", name: "vault" },
        { type: "address", name: "asset" },
      ],
      args.baseParams.serializedParams,
    );

    this.vault = decoded[2];
    this.asset = decoded[3];
  }
}
