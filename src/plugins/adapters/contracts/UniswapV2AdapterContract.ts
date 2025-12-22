import { iUniswapV2AdapterAbi } from "@gearbox-protocol/integrations-v3";
import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
} from "viem";
import type { ConstructOptions } from "../../../sdk/index.js";
import { formatBN } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iUniswapV2AdapterAbi;
type abi = typeof abi;

export class UniswapV2AdapterContract extends AbstractAdapterContract<abi> {
  public readonly supportedPairs: {
    token0: Address;
    token1: Address;
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
          name: "supportedPairs",
          components: [
            { type: "address", name: "token0" },
            { type: "address", name: "token1" },
          ],
        },
      ],
      args.baseParams.serializedParams,
    );

    this.supportedPairs = decoded[2].map(pair => ({
      token0: pair.token0,
      token1: pair.token1,
    }));
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
}
