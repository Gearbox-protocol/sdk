import { iConvexV1BoosterAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { GearboxSDK } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iConvexV1BoosterAdapterAbi;
type abi = typeof abi;

export class ConvexV1BoosterAdapterContract extends AbstractAdapterContract<abi> {
  public readonly supportedPools: {
    pid: number;
    curveToken: Address;
    convexToken: Address;
    phantomToken: Address;
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
            { type: "uint256", name: "pid" },
            { type: "address", name: "curveToken" },
            { type: "address", name: "convexToken" },
            { type: "address", name: "phantomToken" },
          ],
        },
      ],
      args.baseParams.serializedParams,
    );

    this.supportedPools = decoded[2].map(pool => ({
      pid: Number(pool.pid),
      curveToken: pool.curveToken,
      convexToken: pool.convexToken,
      phantomToken: pool.phantomToken,
    }));
  }
}
