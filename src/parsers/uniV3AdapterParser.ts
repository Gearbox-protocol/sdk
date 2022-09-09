import { SupportedContract } from "../contracts/contracts";
import { IUniswapV3Adapter__factory } from "../types";
import { formatBN } from "../utils/formatter";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class UniswapV3AdapterParser extends AbstractParser implements IParser {
  constructor(contract: SupportedContract, isContract: boolean) {
    super(contract);
    this.ifc = IUniswapV3Adapter__factory.createInterface();
    if (!isContract) this.adapterName = "UniswapV3Adapter";
  }
  parse(calldata: string): string {
    const { functionFragment, functionName } = this.parseSelector(calldata);

    switch (functionFragment.name) {
      case "exactInputSingle": {
        const [[tokenIn, tokenOut, fee, , , amountIn, amountOutMinimum]] =
          this.decodeFunctionData(functionFragment, calldata);
        const tokenInSym = this.tokenSymbol(tokenIn);
        const tokenOutSym = this.tokenSymbol(tokenOut);

        const amountInStr = this.formatBN(amountIn, tokenIn);
        const amountOutMinimumStr = this.formatBN(amountOutMinimum, tokenOut);

        return `${functionName}(amountIn: ${amountInStr}, amountOutMinimum: ${amountOutMinimumStr},  path: ${tokenInSym} ==(fee: ${fee})==> ${tokenOutSym})`;
      }
      case "exactAllInputSingle": {
        const {
          params: { tokenIn, tokenOut, fee, rateMinRAY },
        } = this.decodeFunctionData(functionFragment, calldata);
        const tokenInSym = this.tokenSymbol(tokenIn);
        const tokenOutSym = this.tokenSymbol(tokenOut);

        return `${functionName}(rate: ${formatBN(
          rateMinRAY,
          27,
        )},  path: ${tokenInSym} ==(fee: ${fee})==> ${tokenOutSym})`;
      }
      case "exactInput": {
        const {
          params: { amountIn, amountOutMinimum, path },
        } = this.decodeFunctionData(functionFragment, calldata);

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
      case "exactAllInput": {
        const {
          params: { rateMinRAY, path },
        } = this.decodeFunctionData(functionFragment, calldata);

        const pathStr = this.trackInputPath(path);

        return `${functionName}(rate: ${formatBN(
          rateMinRAY,
          27,
        )},  path: ${pathStr}`;
      }
      case "exactOutput": {
        const {
          params: { amountInMaximum, amountOut, path },
        } = this.decodeFunctionData(functionFragment, calldata);

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
        const [[tokenIn, tokenOut, fee, , , amountOut, amountInMaximum]] =
          this.decodeFunctionData(functionFragment, calldata);

        const tokenInSym = this.tokenSymbol(tokenIn);
        const tokenOutSym = this.tokenSymbol(tokenOut);

        const amountInMaximumStr = this.formatBN(amountInMaximum, tokenInSym);
        const amountOutStr = this.formatBN(amountOut, tokenOutSym);

        return `${functionName}(amountInMaximum: ${amountInMaximumStr}, amountOut: ${amountOutStr},  path: ${tokenInSym} ==(fee: ${fee})==> ${tokenOutSym})`;
      }

      default:
        return `${functionName}: Unknown operation ${functionFragment.name} with calldata ${calldata}`;
    }
  }

  trackInputPath(path: string): string {
    let result = "";
    let pointer = path.startsWith("0x") ? 2 : 0;
    while (pointer <= path.length - 40) {
      const from = `0x${path.slice(pointer, pointer + 40)}`.toLowerCase();
      result += this.tokenSymbol(from) || from;
      pointer += 40;

      if (pointer > path.length - 6) return result;

      const fee = parseInt(path.slice(pointer, pointer + 6), 16);

      pointer += 6;
      result += ` ==(fee: ${fee})==> `;
    }

    return result;
  }

  trackOutputPath(path: string): string {
    let result = "";
    let pointer = path.length;
    while (pointer >= 40) {
      pointer -= 40;
      const from = `0x${path.slice(pointer, pointer + 40)}`;
      result += this.tokenSymbol(from) || from;

      if (pointer < 6) return result;
      pointer -= 6;
      const fee = parseInt(path.slice(pointer, pointer + 6), 16);

      result += ` ==(fee: ${fee})==> `;
    }

    return result;
  }
}
