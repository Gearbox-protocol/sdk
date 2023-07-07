import { pack } from "@ethersproject/solidity";
import { expect } from "chai";

import { DUMB_ADDRESS, RAY, WAD } from "../core/constants";
import { tokenDataByNetwork } from "../tokens/token";
import { IUniswapV3Adapter__factory } from "../types";
import { UniswapV3AdapterParser } from "./uniV3AdapterParser";

const pathToUniV3Path = (path: Array<string>): string => {
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

  return pack(types, pathWithFees);
};

describe("UniswapV3AdapterParser test", () => {
  it("swap functions works well", () => {
    let parser = new UniswapV3AdapterParser("UNISWAP_V3_ROUTER", false);

    const ifc = IUniswapV3Adapter__factory.createInterface();

    let parsed = parser.parse(
      ifc.encodeFunctionData("exactInputSingle", [
        {
          tokenIn: tokenDataByNetwork.Arbitrum["1INCH"],
          tokenOut: tokenDataByNetwork.Arbitrum["3Crv"],
          fee: 3000,
          recipient: DUMB_ADDRESS,
          deadline: 12300,
          amountIn: WAD * 1299000n,
          amountOutMinimum: WAD * 10200n,
          sqrtPriceLimitX96: 0,
        },
      ]),
    );

    expect(parsed).to.be.eq(
      "UniswapV3Adapter[UNISWAP_V3_ROUTER].exactInputSingle(amountIn: 1.29M [1299000000000000000000000], amountOutMinimum: 10.20K [10200000000000000000000],  path: 1INCH ==(fee: 3000)==> 3Crv)",
      "Incorrect parse swapExactTokensForTokens",
    );

    parsed = parser.parse(
      ifc.encodeFunctionData("exactAllInputSingle", [
        {
          tokenIn: tokenDataByNetwork.Arbitrum["1INCH"],
          tokenOut: tokenDataByNetwork.Arbitrum["3Crv"],
          fee: 3000,
          deadline: 12300,
          rateMinRAY: RAY * 1200n,
          sqrtPriceLimitX96: 0,
        },
      ]),
    );

    expect(parsed).to.be.eq(
      "UniswapV3Adapter[UNISWAP_V3_ROUTER].exactAllInputSingle(rate: 1.20K,  path: 1INCH ==(fee: 3000)==> 3Crv)",
      "Incorrect parse swapExactTokensForTokens",
    );

    parsed = parser.parse(
      ifc.encodeFunctionData("exactInput", [
        {
          path: pathToUniV3Path([
            tokenDataByNetwork.Mainnet.AAVE,
            tokenDataByNetwork.Mainnet.LINK,
            tokenDataByNetwork.Mainnet.USDC,
          ]),
          recipient: DUMB_ADDRESS,
          deadline: 1232131,
          amountIn: WAD * 12399n,
          amountOutMinimum: BigInt(1e6) * 122n,
        },
      ]),
    );

    expect(parsed).to.be.eq(
      "UniswapV3Adapter[UNISWAP_V3_ROUTER].exactInput(amountIn: 12.39K [12399000000000000000000], amountOutMinimum: 122.00 [122000000],  path: AAVE ==(fee: 3000)==> LINK ==(fee: 3000)==> USDC",
      "Incorrect parse swapExactTokensForTokens",
    );

    parsed = parser.parse(
      ifc.encodeFunctionData("exactAllInput", [
        {
          path: pathToUniV3Path([
            tokenDataByNetwork.Mainnet.AAVE,
            tokenDataByNetwork.Mainnet.LINK,
            tokenDataByNetwork.Mainnet.USDC,
          ]),
          rateMinRAY: RAY * 1200n,
          deadline: 1232131,
        },
      ]),
    );

    expect(parsed).to.be.eq(
      "UniswapV3Adapter[UNISWAP_V3_ROUTER].exactAllInput(rate: 1.20K,  path: AAVE ==(fee: 3000)==> LINK ==(fee: 3000)==> USDC",
      "Incorrect parse swapExactTokensForTokens",
    );

    parsed = parser.parse(
      ifc.encodeFunctionData("exactOutputSingle", [
        {
          tokenIn: tokenDataByNetwork.Arbitrum["1INCH"],
          tokenOut: tokenDataByNetwork.Arbitrum.USDC,
          fee: 10000,
          recipient: DUMB_ADDRESS,
          deadline: 12300,
          amountInMaximum: (WAD * 149n) / 1000n,
          amountOut: 102e6,
          sqrtPriceLimitX96: 0,
        },
      ]),
    );

    expect(parsed).to.be.eq(
      "UniswapV3Adapter[UNISWAP_V3_ROUTER].exactOutputSingle(amountInMaximum: 0.14 [149000000000000000], amountOut: 102.00 [102000000],  path: 1INCH ==(fee: 10000)==> USDC)",
      "Incorrect parse swapExactTokensForTokens",
    );

    parsed = parser.parse(
      ifc.encodeFunctionData("exactOutput", [
        {
          path: pathToUniV3Path([
            tokenDataByNetwork.Mainnet.AAVE,
            tokenDataByNetwork.Mainnet.LINK,
            tokenDataByNetwork.Mainnet.USDC,
          ]),
          recipient: DUMB_ADDRESS,
          deadline: 1232131,
          amountInMaximum: 123e6,
          amountOut: WAD * 122n,
        },
      ]),
    );

    expect(parsed).to.be.eq(
      "UniswapV3Adapter[UNISWAP_V3_ROUTER].exactOutput(amountInMaximum: 123.00 [123000000], amountOut: 122.00 [122000000000000000000],  path: USDC ==(fee: 3000)==> LINK ==(fee: 3000)==> AAVE",
      "Incorrect parse swapExactTokensForTokens",
    );
  });
});
