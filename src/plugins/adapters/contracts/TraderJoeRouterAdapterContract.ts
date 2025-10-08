import { iTraderJoeRouterAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { GearboxSDK } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";
import type { TraderJoePoolVersion } from "./types.js";

const abi = iTraderJoeRouterAdapterAbi;
type abi = typeof abi;

export class TraderJoeRouterAdapterContract extends AbstractAdapterContract<abi> {
  public readonly supportedPools: {
    token0: Address;
    token1: Address;
    binStep: number;
    poolVersion: TraderJoePoolVersion;
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
            { type: "uint256", name: "binStep" },
            { type: "uint8", name: "poolVersion" },
          ],
        },
      ],
      args.baseParams.serializedParams,
    );

    this.supportedPools = decoded[2].map(pool => ({
      token0: pool.token0,
      token1: pool.token1,
      binStep: Number(pool.binStep),
      poolVersion: pool.poolVersion as TraderJoePoolVersion,
    }));
  }
}
