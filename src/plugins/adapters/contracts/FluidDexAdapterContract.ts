import { iFluidDexAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { GearboxSDK } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iFluidDexAdapterAbi;
type abi = typeof abi;

export class FluidDexAdapterContract extends AbstractAdapterContract<abi> {
  public readonly token0: Address;
  public readonly token1: Address;

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
        { type: "address", name: "token0" },
        { type: "address", name: "token1" },
      ],
      args.baseParams.serializedParams,
    );

    this.token0 = decoded[2];
    this.token1 = decoded[3];
  }
}
