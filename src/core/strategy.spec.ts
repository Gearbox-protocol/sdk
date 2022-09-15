import { expect } from "chai";
import { BigNumber } from "ethers";

import { decimals } from "../tokens/decimals";
import { tokenDataByNetwork } from "../tokens/token";
import { toBN, toSignificant } from "../utils/formatter";
import { LEVERAGE_DECIMALS, WAD_DECIMALS_POW } from "./constants";
import { Strategy, StrategyPayload } from "./strategy";

const lidoPayload: StrategyPayload = {
  name: "Lido",
  lpToken: tokenDataByNetwork.Mainnet.STETH,
  apyTokenSymbol: "STETH",

  apy: 38434,

  pools: [tokenDataByNetwork.Mainnet.WETH],

  unleveragableCollateral: [
    tokenDataByNetwork.Mainnet.USDC,
    tokenDataByNetwork.Mainnet.DAI,
    tokenDataByNetwork.Mainnet.WBTC,
  ],
  leveragableCollateral: [],

  baseAssets: [tokenDataByNetwork.Mainnet.WETH],
};

const lidoStrategy = new Strategy(lidoPayload);

const pools = {
  "0x1": {
    borrowRate: 7712,
  },
  "0x2": {
    borrowRate: 5736,
  },
} as const;

const prices = {
  [tokenDataByNetwork.Mainnet.WETH.toLowerCase()]:
    BigNumber.from("0x2877fe0cf0"),
  [tokenDataByNetwork.Mainnet.DAI.toLowerCase()]: BigNumber.from("0x05f4faef"),
  [tokenDataByNetwork.Mainnet.STETH.toLowerCase()]:
    BigNumber.from("0x27abe44400"),
};

const liquidationThresholds = {
  [tokenDataByNetwork.Mainnet.DAI.toLowerCase()]: BigNumber.from("0x2454"),
  [tokenDataByNetwork.Mainnet.WETH.toLowerCase()]: BigNumber.from("0x2134"),
  [tokenDataByNetwork.Mainnet.STETH.toLowerCase()]: BigNumber.from("0x2328"),
};

describe("Strategy test", () => {
  it("maxAPY calculation is correct", () => {
    const result = lidoStrategy.maxAPY(10 * LEVERAGE_DECIMALS, pools);

    expect(result).to.be.eq(332716);
  });
  it("overallAPY calculation is correct", () => {
    const result = lidoStrategy.overallAPY(
      lidoStrategy.apy || 0,
      10 * LEVERAGE_DECIMALS,
      tokenDataByNetwork.Mainnet.WETH,
      pools["0x2"].borrowRate,
    );

    expect(result).to.be.eq(332716);
  });
  it("liquidationPrice calculation is correct", () => {
    const result = lidoStrategy.liquidationPrice({
      assets: [
        {
          balance: toBN("30", decimals.WETH),
          token: tokenDataByNetwork.Mainnet.WETH,
        },
      ],
      liquidationThresholds,
      prices,
      borrowed: toBN("90", decimals.WETH),
      underlyingToken: tokenDataByNetwork.Mainnet.WETH,
      lpAmount: toBN("119.40", decimals.STETH),
      lpToken: tokenDataByNetwork.Mainnet.STETH,
    });

    expect(Number(toSignificant(result, WAD_DECIMALS_POW)).toFixed(3)).to.be.eq(
      "0.551",
    );
  });
  it("liquidationPrice maxLeverage is correct", () => {
    const result = Strategy.maxLeverage(tokenDataByNetwork.Mainnet.STETH, [
      { address: "0x1", liquidationThresholds },
    ]);

    expect(result).to.be.eq(9 * LEVERAGE_DECIMALS);
  });
});
