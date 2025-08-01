import type { Address, DecodeFunctionDataReturnType } from "viem";

import type { GearboxSDK } from "../../sdk/index.js";
import { formatBN } from "../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";
import { iUniswapV3AdapterAbi } from "./abi/index.js";

const abi = iUniswapV3AdapterAbi;

export class UniswapV3AdapterContract extends AbstractAdapterContract<
  typeof abi
> {
  constructor(
    sdk: GearboxSDK,
    args: Omit<AbstractAdapterContractOptions<typeof abi>, "abi">,
  ) {
    super(sdk, {
      ...args,
      abi,
    });
  }

  protected parseFunctionParams(
    params: DecodeFunctionDataReturnType<typeof abi>,
  ): string[] | undefined {
    switch (params.functionName) {
      case "exactInputSingle": {
        const [{ tokenIn, tokenOut, fee, amountIn, amountOutMinimum }] =
          params.args;
        const tokenInSym = this.sdk.tokensMeta.symbol(tokenIn);
        const tokenOutSym = this.sdk.tokensMeta.symbol(tokenOut);

        const amountInStr = this.sdk.tokensMeta.formatBN(tokenIn, amountIn);
        const amountOutMinimumStr = this.sdk.tokensMeta.formatBN(
          tokenOut,
          amountOutMinimum,
        );

        return [
          `(amountIn: ${amountInStr}, amountOutMinimum: ${amountOutMinimumStr},  path: ${tokenInSym} ==(fee: ${fee})==> ${tokenOutSym})`,
        ];
      }
      case "exactDiffInputSingle": {
        const [{ tokenIn, tokenOut, fee, leftoverAmount, rateMinRAY }] =
          params.args;
        const tokenInSym = this.sdk.tokensMeta.symbol(tokenIn);
        const tokenOutSym = this.sdk.tokensMeta.symbol(tokenOut);

        const leftoverAmountStr = this.sdk.tokensMeta.formatBN(
          tokenIn,
          leftoverAmount,
        );
        const rateStr = formatBN(rateMinRAY, 27);
        return [
          `(leftoverAmount: ${leftoverAmountStr}, rate: ${rateStr},  path: ${tokenInSym} ==(fee: ${fee})==> ${tokenOutSym})`,
        ];
      }
      case "exactInput": {
        const [{ amountIn, amountOutMinimum, path }] = params.args;

        const pathStr = this.trackInputPath(path);
        const token = `0x${path.replace("0x", "").slice(0, 40)}` as Address;
        const amountInStr = this.sdk.tokensMeta.formatBN(token, amountIn);

        const amountOutMinimumStr = this.sdk.tokensMeta.formatBN(
          `0x${path.slice(-40, path.length)}`,
          amountOutMinimum,
        );

        return [
          `(amountIn: ${amountInStr}, amountOutMinimum: ${amountOutMinimumStr},  path: ${pathStr}`,
        ];
      }
      case "exactDiffInput": {
        const [{ leftoverAmount, rateMinRAY, path }] = params.args;

        const leftoverAmountStr = this.sdk.tokensMeta.formatBN(
          `0x${path.replace("0x", "").slice(0, 40)}`,
          leftoverAmount,
        );

        const pathStr = this.trackInputPath(path);

        return [
          `(leftoverAmount: ${leftoverAmountStr}, rate: ${formatBN(
            rateMinRAY,
            27,
          )},  path: ${pathStr}`,
        ];
      }
      case "exactOutput": {
        const [{ amountInMaximum, amountOut, path }] = params.args;

        const pathStr = this.trackOutputPath(path);
        const amountInMaximumStr = this.sdk.tokensMeta.formatBN(
          `0x${path.slice(-40, path.length)}`,
          amountInMaximum,
        );

        const amountOutStr = this.sdk.tokensMeta.formatBN(
          `0x${path.replace("0x", "").slice(0, 40)}`,
          amountOut,
        );

        return [
          `(amountInMaximum: ${amountInMaximumStr}, amountOut: ${amountOutStr},  path: ${pathStr}`,
        ];
      }
      case "exactOutputSingle": {
        const [{ tokenIn, tokenOut, fee, amountOut, amountInMaximum }] =
          params.args;

        const tokenInSym = this.sdk.tokensMeta.symbol(tokenIn);
        const tokenOutSym = this.sdk.tokensMeta.symbol(tokenOut);

        const amountInMaximumStr = this.sdk.tokensMeta.formatBN(
          tokenIn,
          amountInMaximum,
        );
        const amountOutStr = this.sdk.tokensMeta.formatBN(tokenOut, amountOut);

        return [
          `(amountInMaximum: ${amountInMaximumStr}, amountOut: ${amountOutStr},  path: ${tokenInSym} ==(fee: ${fee})==> ${tokenOutSym})`,
        ];
      }

      default:
        return undefined;
    }
  }

  private trackInputPath(path: string): string {
    let result = "";
    let pointer = path.startsWith("0x") ? 2 : 0;
    while (pointer <= path.length - 40) {
      const from =
        `0x${path.slice(pointer, pointer + 40)}`.toLowerCase() as Address;
      result += this.sdk.tokensMeta.symbol(from) || from;
      pointer += 40;

      if (pointer > path.length - 6) return result;

      const fee = parseInt(path.slice(pointer, pointer + 6), 16);

      pointer += 6;
      result += ` ==(fee: ${fee})==> `;
    }

    return result;
  }

  private trackOutputPath(path: string): string {
    let result = "";
    let pointer = path.length;
    while (pointer >= 40) {
      pointer -= 40;
      const from = `0x${path.slice(pointer, pointer + 40)}` as Address;
      result += this.sdk.tokensMeta.symbol(from) || from;

      if (pointer < 6) return result;
      pointer -= 6;
      const fee = parseInt(path.slice(pointer, pointer + 6), 16);

      result += ` ==(fee: ${fee})==> `;
    }

    return result;
  }
}
