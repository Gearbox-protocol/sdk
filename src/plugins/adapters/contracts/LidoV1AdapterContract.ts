import { iLidoV1AdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { GearboxSDK } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iLidoV1AdapterAbi;
type abi = typeof abi;

export class LidoV1AdapterContract extends AbstractAdapterContract<abi> {
  public readonly stETH: Address;
  public readonly weth: Address;
  public readonly treasury: Address;

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
        { type: "address", name: "stETH" },
        { type: "address", name: "weth" },
        { type: "address", name: "treasury" },
      ],
      args.baseParams.serializedParams,
    );

    this.stETH = decoded[2];
    this.weth = decoded[3];
    this.treasury = decoded[4];
  }
}
