import { iVelodromeV2RouterAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { GearboxSDK } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iVelodromeV2RouterAdapterAbi;
type abi = typeof abi;

export class VelodromeV2RouterAdapterContract extends AbstractAdapterContract<abi> {
  public readonly supportedPools: {
    token0: Address;
    token1: Address;
    stable: boolean;
    factory: Address;
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
            { type: "address", name: "factory" },
          ],
        },
      ],
      args.baseParams.serializedParams,
    );

    this.supportedPools = decoded[2].map(pool => ({
      token0: pool.token0,
      token1: pool.token1,
      stable: pool.stable,
      factory: pool.factory,
    }));
  }
}
