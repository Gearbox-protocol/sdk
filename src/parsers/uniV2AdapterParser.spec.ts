import { expect } from "chai";
import { BigNumber } from "ethers";

import { DUMB_ADDRESS, RAY, WAD } from "../core/constants";
import { tokenDataByNetwork } from "../tokens/token";
import { IUniswapV2Adapter__factory } from "../types";
import { UniswapV2AdapterParser } from "./uniV2AdapterParser";

describe("UniswapV2AdapterParser test", () => {
  it("swap functions works well", () => {
    let parser = new UniswapV2AdapterParser("UNISWAP_V2_ROUTER", false);

    const ifc = IUniswapV2Adapter__factory.createInterface();

    let parsed = parser.parse(
      ifc.encodeFunctionData("swapExactTokensForTokens", [
        WAD.mul(180000),
        BigNumber.from(1e6).mul(45),
        [
          tokenDataByNetwork.Mainnet.DAI,
          tokenDataByNetwork.Mainnet.WETH,
          tokenDataByNetwork.Mainnet.USDC,
        ],
        DUMB_ADDRESS,
        45000,
      ]),
    );

    expect(parsed).to.be.eq(
      "UniswapV2Adapter[UNISWAP_V2_ROUTER].swapExactTokensForTokens(amountIn: 180.00K [180000000000000000000000], amountOutMin: 45.00 [45000000], path: [DAI => WETH => USDC])",
      "Incorrect parse swapExactTokensForTokens",
    );

    parsed = parser.parse(
      ifc.encodeFunctionData("swapTokensForExactTokens", [
        BigNumber.from(1e6).mul(234500),
        WAD.mul(17700),
        [
          tokenDataByNetwork.Mainnet.USDC,
          tokenDataByNetwork.Mainnet.DAI,
          tokenDataByNetwork.Mainnet.FRAX,
        ],
        DUMB_ADDRESS,
        45033,
      ]),
    );

    expect(parsed).to.be.eq(
      "UniswapV2Adapter[UNISWAP_V2_ROUTER].swapTokensForExactTokens(amountOut: 234.50K [234500000000], amountInMax: 17.70K [17700000000000000000000], path: [USDC => DAI => FRAX])",
      "Incorrect parse swapTokensForExactTokens",
    );

    parsed = parser.parse(
      ifc.encodeFunctionData("swapAllTokensForTokens", [
        RAY.mul(3240),
        [
          tokenDataByNetwork.Mainnet.USDC,
          tokenDataByNetwork.Mainnet.DAI,
          tokenDataByNetwork.Mainnet.FRAX,
        ],
        45033,
      ]),
    );

    expect(parsed).to.be.eq(
      "UniswapV2Adapter[UNISWAP_V2_ROUTER].swapAllTokensForTokens(rate: 3.24K, path: [USDC => DAI => FRAX])",
      "Incorrect parse swapAllTokensForTokens",
    );
  });
});
