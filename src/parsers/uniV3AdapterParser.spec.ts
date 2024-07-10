import {
  DUMB_ADDRESS,
  RAY,
  tokenDataByNetwork,
  WAD,
} from "@gearbox-protocol/sdk-gov";
import { expect } from "chai";
import { Address, encodeFunctionData, encodePacked } from "viem";

import { iUniswapV3AdapterAbi } from "../types-viem";
import { UniswapV3AdapterParser } from "./uniV3AdapterParser";

const pathToUniV3Path = (path: Array<Address>): Address => {
  const pathWithFees: Array<string | number> = [];
  const types: Array<string> = [];

  path.forEach((p, num) => {
    pathWithFees.push(p);
    types.push("address");
    if (num !== path.length - 1) {
      pathWithFees.push(3000);
      types.push("uint24");
    }
  });

  return encodePacked(types, pathWithFees);
};

describe("UniswapV3AdapterParser test", () => {
  it("swap functions works well", () => {
    let parser = new UniswapV3AdapterParser("UNISWAP_V3_ROUTER", false);

    let parsed = parser.parse(
      encodeFunctionData({
        abi: iUniswapV3AdapterAbi,
        functionName: "exactInput",
        args: [
          {
            path: pathToUniV3Path([
              tokenDataByNetwork.Mainnet.AAVE,
              tokenDataByNetwork.Mainnet.LINK,
              tokenDataByNetwork.Mainnet.USDC,
            ]),
            recipient: DUMB_ADDRESS,
            deadline: 1232131n,
            amountIn: WAD * 12399n,
            amountOutMinimum: BigInt(1e6) * 122n,
          },
        ],
      }),
    );

    expect(parsed).to.be.eq(
      "UniswapV3Adapter[UNISWAP_V3_ROUTER].exactInput(amountIn: 12.39K [12399000000000000000000], amountOutMinimum: 122.00 [122000000],  path: AAVE ==(fee: 3000)==> LINK ==(fee: 3000)==> USDC",
      "Incorrect parse swapExactTokensForTokens",
    );

    parsed = parser.parse(
      encodeFunctionData({
        abi: iUniswapV3AdapterAbi,
        functionName: "exactDiffInput",
        args: [
          {
            path: pathToUniV3Path([
              tokenDataByNetwork.Mainnet.AAVE,
              tokenDataByNetwork.Mainnet.LINK,
              tokenDataByNetwork.Mainnet.USDC,
            ]),
            leftoverAmount: WAD * 12399n,
            rateMinRAY: RAY * 1200n,
            deadline: 1232131n,
          },
        ],
      }),
    );

    expect(parsed).to.be.eq(
      "UniswapV3Adapter[UNISWAP_V3_ROUTER].exactDiffInput(leftoverAmount: 12.39K [12399000000000000000000], rate: 1.20K,  path: AAVE ==(fee: 3000)==> LINK ==(fee: 3000)==> USDC",
      "Incorrect parse swapExactTokensForTokens",
    );

    // parsed = parser.parse(
    //   ifc.encodeFunctionData("exactOutputSingle", [
    //     {
    //       tokenIn: tokenDataByNetwork.Arbitrum["1INCH"],
    //       tokenOut: tokenDataByNetwork.Arbitrum.USDC,
    //       fee: 10000,
    //       recipient: DUMB_ADDRESS,
    //       deadline: 12300,
    //       amountInMaximum: (WAD * 149n) / 1000n,
    //       amountOut: 102e6,
    //       sqrtPriceLimitX96: 0,
    //     },
    //   ]),
    // );

    // expect(parsed).to.be.eq(
    //   "UniswapV3Adapter[UNISWAP_V3_ROUTER].exactOutputSingle(amountInMaximum: 0.14 [149000000000000000], amountOut: 102.00 [102000000],  path: 1INCH ==(fee: 10000)==> USDC)",
    //   "Incorrect parse swapExactTokensForTokens",
    // );

    parsed = parser.parse(
      encodeFunctionData({
        abi: iUniswapV3AdapterAbi,
        functionName: "exactOutput",
        args: [
          {
            path: pathToUniV3Path([
              tokenDataByNetwork.Mainnet.AAVE,
              tokenDataByNetwork.Mainnet.LINK,
              tokenDataByNetwork.Mainnet.USDC,
            ]),
            recipient: DUMB_ADDRESS,
            deadline: 1232131n,
            amountInMaximum: 123000000n,
            amountOut: WAD * 122n,
          },
        ],
      }),
    );

    expect(parsed).to.be.eq(
      "UniswapV3Adapter[UNISWAP_V3_ROUTER].exactOutput(amountInMaximum: 123.00 [123000000], amountOut: 122.00 [122000000000000000000],  path: USDC ==(fee: 3000)==> LINK ==(fee: 3000)==> AAVE",
      "Incorrect parse swapExactTokensForTokens",
    );
  });
});
