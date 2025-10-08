import { iEqualizerRouterAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { GearboxSDK } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iEqualizerRouterAdapterAbi;
type abi = typeof abi;

export class EqualizerRouterAdapterContract extends AbstractAdapterContract<abi> {
  public readonly supportedPools: {
    token0: Address;
    token1: Address;
    stable: boolean;
  }[];

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
        {
          type: "tuple[]",
          name: "supportedPools",
          components: [
            { type: "address", name: "token0" },
            { type: "address", name: "token1" },
            { type: "bool", name: "stable" },
          ],
        },
      ],
      args.baseParams.serializedParams,
    );

    this.supportedPools = decoded[2].map(pool => ({
      token0: pool.token0,
      token1: pool.token1,
      stable: pool.stable,
    }));
  }
}
