import { formatBN, SupportedContract } from "@gearbox-protocol/sdk-gov";
import { Address } from "viem";

import { iUniswapV3AdapterAbi } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class UniswapV3AdapterParser extends AbstractParser implements IParser {
  constructor(contract: SupportedContract, isContract: boolean) {
    super(contract);
    this.abi = iUniswapV3AdapterAbi;
    if (!isContract) this.adapterName = "UniswapV3Adapter";
  }
  parse(calldata: Address): string {
    const { functionData, functionName } = this.parseSelector(calldata);

    switch (functionData.functionName) {
      case "exactInputSingle": {
        const [{ tokenIn, tokenOut, fee, amountIn, amountOutMinimum }] =
          functionData.args || [{}];
        const tokenInSym = this.tokenSymbol(tokenIn);
        const tokenOutSym = this.tokenSymbol(tokenOut);

        const amountInStr = this.formatBN(amountIn, tokenIn);
        const amountOutMinimumStr = this.formatBN(amountOutMinimum, tokenOut);

        return `${functionName}(amountIn: ${amountInStr}, amountOutMinimum: ${amountOutMinimumStr},  path: ${tokenInSym} ==(fee: ${fee})==> ${tokenOutSym})`;
      }
      case "exactDiffInputSingle": {
        const [{ tokenIn, tokenOut, fee, leftoverAmount, rateMinRAY }] =
          functionData.args || [{}];
        const tokenInSym = this.tokenSymbol(tokenIn);
        const tokenOutSym = this.tokenSymbol(tokenOut);

        const leftoverAmountStr = this.formatBN(leftoverAmount, tokenIn);
        return `${functionName}(leftoverAmount: ${leftoverAmountStr}, rate: ${formatBN(
          rateMinRAY,
          27,
        )},  path: ${tokenInSym} ==(fee: ${fee})==> ${tokenOutSym})`;
      }
      case "exactInput": {
        const [{ path, amountIn, amountOutMinimum }] = functionData.args || [
          {},
        ];

        const pathStr = this.trackInputPath(path);
        const amountInStr = this.formatBN(
          amountIn,
          this.tokenSymbol(`0x${path.replace("0x", "").slice(0, 40)}`),
        );

        const amountOutMinimumStr = this.formatBN(
          amountOutMinimum,
          this.tokenSymbol(`0x${path.slice(-40, path.length)}`),
        );

        return `${functionName}(amountIn: ${amountInStr}, amountOutMinimum: ${amountOutMinimumStr},  path: ${pathStr}`;
      }
      case "exactDiffInput": {
        const [{ path, leftoverAmount, rateMinRAY }] = functionData.args || [
          {},
        ];

        const leftoverAmountStr = this.formatBN(
          leftoverAmount,
          this.tokenSymbol(`0x${path.replace("0x", "").slice(0, 40)}`),
        );

        const pathStr = this.trackInputPath(path);

        return `${functionName}(leftoverAmount: ${leftoverAmountStr}, rate: ${formatBN(
          rateMinRAY,
          27,
        )},  path: ${pathStr}`;
      }
      case "exactOutput": {
        const [{ path, amountOut, amountInMaximum }] = functionData.args || [
          {},
        ];
        const pathStr = this.trackOutputPath(path);
        const amountInMaximumStr = this.formatBN(
          amountInMaximum,
          this.tokenSymbol(`0x${path.slice(-40, path.length)}`),
        );

        const amountOutStr = this.formatBN(
          amountOut,
          this.tokenSymbol(`0x${path.replace("0x", "").slice(0, 40)}`),
        );

        return `${functionName}(amountInMaximum: ${amountInMaximumStr}, amountOut: ${amountOutStr},  path: ${pathStr}`;
      }
      case "exactOutputSingle": {
        const [{ tokenIn, tokenOut, fee, amountOut, amountInMaximum }] =
          functionData.args || [{}];

        const tokenInSym = this.tokenSymbol(tokenIn);
        const tokenOutSym = this.tokenSymbol(tokenOut);

        const amountInMaximumStr = this.formatBN(amountInMaximum, tokenInSym);
        const amountOutStr = this.formatBN(amountOut, tokenOutSym);

        return `${functionName}(amountInMaximum: ${amountInMaximumStr}, amountOut: ${amountOutStr},  path: ${tokenInSym} ==(fee: ${fee})==> ${tokenOutSym})`;
      }

      default:
        return this.reportUnknownFragment(
          this.adapterName || this.contract,
          functionName,
          calldata,
        );
    }
  }

  trackInputPath(path: Address): string {
    let result = "";
    let pointer = path.startsWith("0x") ? 2 : 0;
    while (pointer <= path.length - 40) {
      const from = `0x${path.slice(pointer, pointer + 40)}`.toLowerCase();
      result += this.tokenSymbol(from as Address) || from;
      pointer += 40;

      if (pointer > path.length - 6) return result;

      const fee = parseInt(path.slice(pointer, pointer + 6), 16);

      pointer += 6;
      result += ` ==(fee: ${fee})==> `;
    }

    return result;
  }

  trackOutputPath(path: Address): string {
    let result = "";
    let pointer = path.length;
    while (pointer >= 40) {
      pointer -= 40;
      const from = `0x${path.slice(pointer, pointer + 40)}`;
      result += this.tokenSymbol(from as Address) || from;

      if (pointer < 6) return result;
      pointer -= 6;
      const fee = parseInt(path.slice(pointer, pointer + 6), 16);

      result += ` ==(fee: ${fee})==> `;
    }

    return result;
  }
}
