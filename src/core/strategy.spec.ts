import {
  decimals,
  LEVERAGE_DECIMALS,
  PRICE_DECIMALS_POW,
  tokenDataByNetwork,
  WAD_DECIMALS_POW,
} from "@gearbox-protocol/sdk-gov";
import { expect } from "chai";

import { creditManagerByNetwork } from "../contracts/contractsRegister";
import { toBN, toSignificant } from "../utils/formatter";
import { Strategy, StrategyPayload } from "./strategy";

const lidoPayload: StrategyPayload = {
  name: "Lido",
  lpToken: tokenDataByNetwork.Mainnet.STETH,

  apy: 38434,

  creditManagers: [creditManagerByNetwork.Mainnet.WETH_V2],

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
    borrowRate: 27543,
  },
  "0x2": {
    borrowRate: 5736,
  },
} as const;

const prices = {
  [tokenDataByNetwork.Mainnet.WETH.toLowerCase()]: toBN(
    "1738.11830000",
    PRICE_DECIMALS_POW,
  ),
  [tokenDataByNetwork.Mainnet.DAI.toLowerCase()]: toBN(
    "0.99941103",
    PRICE_DECIMALS_POW,
  ),
  [tokenDataByNetwork.Mainnet.STETH.toLowerCase()]: toBN(
    "1703.87588096",
    PRICE_DECIMALS_POW,
  ),
};

const liquidationThresholds = {
  [tokenDataByNetwork.Mainnet.DAI.toLowerCase()]: 9300n,
  [tokenDataByNetwork.Mainnet.WETH.toLowerCase()]: 8500n,
  [tokenDataByNetwork.Mainnet.STETH.toLowerCase()]: 9000n,
};

describe("Strategy test", () => {
  it("maxAPY calculation is correct", () => {
    const result = Strategy.maxAPY(
      53203,
      10 * Number(LEVERAGE_DECIMALS),
      pools["0x1"].borrowRate,
    );

    expect(result).to.be.eq(284143);
  });

  it("liquidationPrice: calculation is correct", () => {
    const result = Strategy.liquidationPrice({
      liquidationThresholds,
      prices,

      borrowed: toBN("350", decimals.WETH),
      underlyingToken: tokenDataByNetwork.Mainnet.WETH,
      targetToken: tokenDataByNetwork.Mainnet.STETH,
      assets: {
        [tokenDataByNetwork.Mainnet.STETH.toLowerCase()]: {
          balance: toBN("400", decimals.STETH),
          token: tokenDataByNetwork.Mainnet.STETH,
        },
      },
    });

    expect(Number(toSignificant(result, WAD_DECIMALS_POW)).toFixed(3)).to.be.eq(
      "0.992",
    );
  });
  it("liquidationPrice: zero result when debt is compensated", () => {
    const result = Strategy.liquidationPrice({
      liquidationThresholds,
      prices,

      borrowed: toBN("350", decimals.WETH),
      underlyingToken: tokenDataByNetwork.Mainnet.WETH,
      targetToken: tokenDataByNetwork.Mainnet.STETH,
      assets: {
        [tokenDataByNetwork.Mainnet.STETH.toLowerCase()]: {
          balance: toBN("400", decimals.STETH),
          token: tokenDataByNetwork.Mainnet.STETH,
        },
        [tokenDataByNetwork.Mainnet.WETH.toLowerCase()]: {
          balance: toBN("350", decimals.WETH),
          token: tokenDataByNetwork.Mainnet.WETH,
        },
      },
    });

    expect(Number(toSignificant(result, WAD_DECIMALS_POW)).toFixed(3)).to.be.eq(
      "0.000",
    );
  });
  it("liquidationPrice: zero result when debt is overcompensated", () => {
    const result = Strategy.liquidationPrice({
      liquidationThresholds,
      prices,

      borrowed: toBN("350", decimals.WETH),
      underlyingToken: tokenDataByNetwork.Mainnet.WETH,
      targetToken: tokenDataByNetwork.Mainnet.STETH,
      assets: {
        [tokenDataByNetwork.Mainnet.STETH.toLowerCase()]: {
          balance: toBN("400", decimals.STETH),
          token: tokenDataByNetwork.Mainnet.STETH,
        },
        [tokenDataByNetwork.Mainnet.WETH.toLowerCase()]: {
          balance: toBN("450", decimals.WETH),
          token: tokenDataByNetwork.Mainnet.WETH,
        },
      },
    });

    expect(Number(toSignificant(result, WAD_DECIMALS_POW)).toFixed(3)).to.be.eq(
      "0.000",
    );
  });
  it("liquidationPrice: zero result when debt is not compensated", () => {
    const result = Strategy.liquidationPrice({
      liquidationThresholds,
      prices,

      borrowed: toBN("450", decimals.WETH),
      underlyingToken: tokenDataByNetwork.Mainnet.WETH,
      targetToken: tokenDataByNetwork.Mainnet.STETH,
      assets: {
        [tokenDataByNetwork.Mainnet.STETH.toLowerCase()]: {
          balance: toBN("400", decimals.STETH),
          token: tokenDataByNetwork.Mainnet.STETH,
        },
        [tokenDataByNetwork.Mainnet.WETH.toLowerCase()]: {
          balance: toBN("100", decimals.WETH),
          token: tokenDataByNetwork.Mainnet.WETH,
        },
      },
    });

    expect(Number(toSignificant(result, WAD_DECIMALS_POW)).toFixed(3)).to.be.eq(
      "0.992",
    );
  });

  it("maxLeverage is correct", () => {
    const result = Strategy.maxLeverage(tokenDataByNetwork.Mainnet.STETH, [
      { address: "0x1", liquidationThresholds },
    ]);

    expect(result).to.be.eq(9 * Number(LEVERAGE_DECIMALS));
  });
});
