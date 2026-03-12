import {
  iUniswapV4AdapterAbi,
  iUniswapV4GatewayAbi,
} from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { ConstructOptions, ParsedCallV2 } from "../../../sdk/index.js";
import { MissingSerializedParamsError } from "../../../sdk/index.js";
import type {
  LegacyAdapterOperation,
  Transfers,
} from "../legacyAdapterOperations.js";
import { swapFromTransfers } from "../transferHelpers.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iUniswapV4AdapterAbi;
type abi = typeof abi;

const protocolAbi = iUniswapV4GatewayAbi;
type protocolAbi = typeof protocolAbi;
export class UniswapV4AdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #supportedPoolKeys?: {
    token0: Address;
    token1: Address;
    fee: number;
    tickSpacing: number;
    hooks: Address;
  }[];

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
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

      this.#supportedPoolKeys = decoded[2].map(pool => ({
        token0: pool.token0,
        token1: pool.token1,
        fee: pool.fee,
        tickSpacing: pool.tickSpacing,
        hooks: pool.hooks,
      }));
    }
  }

  get supportedPoolKeys(): {
    token0: Address;
    token1: Address;
    fee: number;
    tickSpacing: number;
    hooks: Address;
  }[] {
    if (!this.#supportedPoolKeys)
      throw new MissingSerializedParamsError("supportedPoolKeys");
    return this.#supportedPoolKeys;
  }

  /** @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type.go#L81-L91 */
  protected override classifyLegacyOperation(
    _parsed: ParsedCallV2,
    transfers: Transfers,
  ): LegacyAdapterOperation {
    return { operation: "UniswapSwap", ...swapFromTransfers(transfers) };
  }
}
