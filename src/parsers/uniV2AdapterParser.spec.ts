import {
  DUMB_ADDRESS,
  RAY,
  tokenDataByNetwork,
  WAD,
} from "@gearbox-protocol/sdk-gov";
import { expect } from "chai";
import { encodeFunctionData } from "viem";

import { iUniswapV2AdapterAbi } from "../types-viem";
import { UniswapV2AdapterParser } from "./uniV2AdapterParser";

describe("UniswapV2AdapterParser test", () => {
  it("swap functions works well", () => {
    let parser = new UniswapV2AdapterParser("UNISWAP_V2_ROUTER", false);

    let parsed = parser.parse(
      encodeFunctionData({
        abi: iUniswapV2AdapterAbi,
        functionName: "swapExactTokensForTokens",
        args: [
          WAD * 180000n,
          BigInt(1e6) * 45n,
          [
            tokenDataByNetwork.Mainnet.DAI,
            tokenDataByNetwork.Mainnet.WETH,
            tokenDataByNetwork.Mainnet.USDC,
          ],
          DUMB_ADDRESS,
          45000n,
        ],
      }),
    );
    expect(parsed).to.be.eq(
      "UniswapV2Adapter[UNISWAP_V2_ROUTER].swapExactTokensForTokens(amountIn: 180.00K [180000000000000000000000], amountOutMin: 45.00 [45000000], path: [DAI => WETH => USDC])",
      "Incorrect parse swapExactTokensForTokens",
    );

    parsed = parser.parse(
      encodeFunctionData({
        abi: iUniswapV2AdapterAbi,
        functionName: "swapTokensForExactTokens",
        args: [
          BigInt(1e6) * 234500n,
          WAD * 17700n,
          [
            tokenDataByNetwork.Mainnet.USDC,
            tokenDataByNetwork.Mainnet.DAI,
            tokenDataByNetwork.Mainnet.FRAX,
          ],
          DUMB_ADDRESS,
          45033n,
        ],
      }),
    );
    expect(parsed).to.be.eq(
      "UniswapV2Adapter[UNISWAP_V2_ROUTER].swapTokensForExactTokens(amountOut: 234.50K [234500000000], amountInMax: 17.70K [17700000000000000000000], path: [USDC => DAI => FRAX])",
      "Incorrect parse swapTokensForExactTokens",
    );

    parsed = parser.parse(
      encodeFunctionData({
        abi: iUniswapV2AdapterAbi,
        functionName: "swapDiffTokensForTokens",
        args: [
          BigInt(1e6) * 234500n,
          RAY * 3240n,
          [
            tokenDataByNetwork.Mainnet.USDC,
            tokenDataByNetwork.Mainnet.DAI,
            tokenDataByNetwork.Mainnet.FRAX,
          ],
          45033n,
        ],
      }),
    );
    expect(parsed).to.be.eq(
      "UniswapV2Adapter[UNISWAP_V2_ROUTER].swapDiffTokensForTokens(leftoverAmount: 234.50K [234500000000], rate: 3.24K, path: [USDC => DAI => FRAX])",
      "Incorrect parse swapDiffTokensForTokens",
    );
  });
});
