import { iUniswapV4AdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { ConstructOptions } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iUniswapV4AdapterAbi;
type abi = typeof abi;

export class UniswapV4AdapterContract extends AbstractAdapterContract<abi> {
  public readonly supportedPoolKeys: {
    token0: Address;
    token1: Address;
    fee: number;
    tickSpacing: number;
    hooks: Address;
  }[];

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
        {
          type: "tuple[]",
          name: "supportedPools",
          components: [
            { type: "address", name: "token0" },
            { type: "address", name: "token1" },
            { type: "uint24", name: "fee" },
            { type: "int24", name: "tickSpacing" },
            { type: "address", name: "hooks" },
          ],
        },
      ],
      args.baseParams.serializedParams,
    );

    this.supportedPoolKeys = decoded[2].map(pool => ({
      token0: pool.token0,
      token1: pool.token1,
      fee: pool.fee,
      tickSpacing: pool.tickSpacing,
      hooks: pool.hooks,
    }));
  }
}
