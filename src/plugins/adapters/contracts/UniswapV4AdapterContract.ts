import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
} from "viem";
import type {
  AssetsMap,
  OnchainSDK,
  ParsedCallV2,
} from "../../../sdk/index.js";
import { MissingSerializedParamsError } from "../../../sdk/index.js";
import {
  iUniswapV4AdapterAbi,
  iUniswapV4GatewayAbi,
} from "../abi/adapters/index.js";
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

  constructor(sdk: OnchainSDK, args: ConcreteAdapterContractOptions) {
    super(sdk, { ...args, abi, protocolAbi });

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

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      supportedPoolKeys: this.#supportedPoolKeys?.map(p => ({
        token0: this.labelAddress(p.token0),
        token1: this.labelAddress(p.token1),
        fee: p.fee,
        tickSpacing: p.tickSpacing,
        hooks: this.labelAddress(p.hooks),
      })),
    };
  }

  /** @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type.go#L81-L91 */
  public override classifyLegacyOperation(
    _parsed: ParsedCallV2,
    transfers: Transfers,
  ): LegacyAdapterOperation {
    return { operation: "UniswapSwap", ...swapFromTransfers(transfers) };
  }

  protected override async applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): Promise<void> {
    switch (decoded.functionName) {
      case "swapExactInputSingleDiff": {
        const [poolKey, zeroForOne, leftoverAmount] = decoded.args;
        this.setLeftover(
          balances,
          zeroForOne ? poolKey.token0 : poolKey.token1,
          leftoverAmount,
        );
        break;
      }
      default:
        await super.applyBalanceChanges(balances, decoded);
    }
  }
}
