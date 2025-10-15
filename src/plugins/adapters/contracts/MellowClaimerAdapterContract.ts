import { iMellowClaimerAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { GearboxSDK } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iMellowClaimerAdapterAbi;
type abi = typeof abi;

export class MellowClaimerAdapterContract extends AbstractAdapterContract<abi> {
  public readonly allowedMultiVaults: Address[];

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
        { type: "address[]", name: "allowedMultiVaults" },
      ],
      args.baseParams.serializedParams,
    );

    this.allowedMultiVaults = [...decoded[2]];
  }
}
