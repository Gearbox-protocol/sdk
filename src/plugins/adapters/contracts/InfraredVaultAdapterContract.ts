import { iInfraredVaultAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { ConstructOptions } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iInfraredVaultAdapterAbi;
type abi = typeof abi;

export class InfraredVaultAdapterContract extends AbstractAdapterContract<abi> {
  public readonly stakingToken: Address;
  public readonly stakedPhantomToken: Address;

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
        { type: "address", name: "stakingToken" },
        { type: "address", name: "stakedPhantomToken" },
      ],
      args.baseParams.serializedParams,
    );

    this.stakingToken = decoded[2];
    this.stakedPhantomToken = decoded[3];
  }
}
