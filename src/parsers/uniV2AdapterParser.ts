import type { SupportedContract } from "@gearbox-protocol/sdk-gov";
import { formatBN } from "@gearbox-protocol/sdk-gov";
import type { Address } from "viem";

import { iUniswapV2AdapterAbi } from "../types";
import { AbstractParser } from "./abstractParser";
import type { IParser } from "./iParser";

export class UniswapV2AdapterParser extends AbstractParser implements IParser {
  constructor(contract: SupportedContract, isContract: boolean) {
    super(contract);
    this.abi = iUniswapV2AdapterAbi;
    if (!isContract) this.adapterName = "UniswapV2Adapter";
  }
  parse(calldata: Address): string {
    const { operationName, functionData } = this.parseSelector(calldata);

    switch (functionData.functionName) {
      case "swapExactTokensForTokens": {
        const [amountIn, amountOutMin, path] = functionData.args || [];
        const pathStr = (path as Array<Address>)
          .map(r => this.tokenSymbol(r))
          .join(" => ");

        const tokenIn = this.tokenSymbol(path[0]);
        const tokenOut = this.tokenSymbol(path[path.length - 1]);
        const amountInStr = this.formatBN(amountIn, tokenIn);
        const amountOutStr = this.formatBN(amountOutMin, tokenOut);
        return `${operationName}(amountIn: ${amountInStr}, amountOutMin: ${amountOutStr}, path: [${pathStr}])`;
      }

      case "swapTokensForExactTokens": {
        const [amountOut, amountInMax, path] = functionData.args || [];

        const pathStr = (path as Array<Address>)
          .map(r => this.tokenSymbol(r))
          .join(" => ");

        const tokenIn = this.tokenSymbol(path[0]);
        const tokenOut = this.tokenSymbol(path[path.length - 1]);
        const amountOutStr = this.formatBN(amountOut, tokenIn);
        const amountInMaxStr = this.formatBN(amountInMax, tokenOut);

        return `${operationName}(amountOut: ${amountOutStr}, amountInMax: ${amountInMaxStr}, path: [${pathStr}])`;
      }

      case "swapDiffTokensForTokens": {
        const [leftoverAmount, rateMinRAY, path] = functionData.args || [];

        const tokenIn = this.tokenSymbol(path[0]);

        return `${operationName}(leftoverAmount: ${this.formatBN(
          leftoverAmount,
          tokenIn,
        )}, rate: ${formatBN(rateMinRAY, 27)}, path: [${(path as Array<Address>)
          .map(r => this.tokenSymbol(r))
          .join(" => ")}])`;
      }

      default:
        return this.reportUnknownFragment(
          this.adapterName || this.contract,
          operationName,
          calldata,
        );
    }
  }
}
