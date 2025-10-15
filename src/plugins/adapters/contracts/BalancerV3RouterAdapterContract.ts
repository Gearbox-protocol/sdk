import { iBalancerV3RouterAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { GearboxSDK } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iBalancerV3RouterAdapterAbi;
type abi = typeof abi;

export class BalancerV3RouterAdapterContract extends AbstractAdapterContract<abi> {
  public readonly allowedPools: Address[];

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
        { type: "address[]", name: "allowedPools" },
      ],
      args.baseParams.serializedParams,
    );

    this.allowedPools = [...decoded[2]];
  }
}
