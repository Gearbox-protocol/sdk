import { iUniswapV2AdapterAbi } from "@gearbox-protocol/integrations-v3";
import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
} from "viem";
import type { ConstructOptions, ParsedCallV2 } from "../../../sdk/index.js";
import { formatBN, MissingSerializedParamsError } from "../../../sdk/index.js";
import { iUniswapV2Router02Abi } from "../abi/targetContractAbi.js";
import type {
  LegacyAdapterOperation,
  Transfers,
} from "../legacyAdapterOperations.js";
import { swapFromTransfers } from "../transferHelpers.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iUniswapV2AdapterAbi;
type abi = typeof abi;

const protocolAbi = iUniswapV2Router02Abi;
type protocolAbi = typeof protocolAbi;

export class UniswapV2AdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #supportedPairs?: {
    token0: Address;
    token1: Address;
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
            name: "supportedPairs",
            components: [
              { type: "address", name: "token0" },
              { type: "address", name: "token1" },
            ],
          },
        ],
        args.baseParams.serializedParams,
      );

      this.#supportedPairs = decoded[2].map(pair => ({
        token0: pair.token0,
        token1: pair.token1,
      }));
    }
  }

  get supportedPairs(): {
    token0: Address;
    token1: Address;
  }[] {
    if (!this.#supportedPairs)
      throw new MissingSerializedParamsError("supportedPairs");
    return this.#supportedPairs;
  }

  protected override stringifyFunctionParams(
    params: DecodeFunctionDataReturnType<abi>,
  ): string[] {
    switch (params.functionName) {
      case "swapDiffTokensForTokens": {
        const [leftoverAmount, rateMinRAY, path, _deadline] = params.args;

        const leftoverAmountStr = this.tokensMeta.formatBN(
          path[0],
          leftoverAmount,
        );

        const pathStr = path.map(t => this.labelAddress(t)).join(" => ");

        return [
          `(leftoverAmount: ${leftoverAmountStr}, rate: ${formatBN(
            rateMinRAY,
            27,
          )},  path: ${pathStr}`,
        ];
      }

      default:
        return super.stringifyFunctionParams(params);
    }
  }

  /** @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type.go#L81-L91 */
  protected override classifyLegacyOperation(
    _parsed: ParsedCallV2,
    transfers: Transfers,
  ): LegacyAdapterOperation {
    return { operation: "UniswapSwap", ...swapFromTransfers(transfers) };
  }
}
