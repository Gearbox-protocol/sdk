import { expect } from "chai";
import { BigNumber } from "ethers";

import { decimals } from "../tokens/decimals";
import { tokenDataByNetwork } from "../tokens/token";
import { toBN } from "../utils/formatter";
import { Asset } from "./assets";
import { calcHealthFactor } from "./creditManager";

const underlyingToken = tokenDataByNetwork.Mainnet.DAI;
const borrowed = toBN("156552", decimals.DAI);

const assets: Array<Asset> = [
  {
    balance: borrowed,
    token: underlyingToken,
  },
  {
    balance: toBN("10", decimals.WETH),
    token: tokenDataByNetwork.Mainnet.WETH,
  },
];

const liquidationThresholds = {
  [underlyingToken]: BigNumber.from("0x2454"),
  [tokenDataByNetwork.Mainnet.WETH]: BigNumber.from("0x2134"),
};

const prices = {
  [underlyingToken]: BigNumber.from("0x05f4faef"),
  [tokenDataByNetwork.Mainnet.WETH]: BigNumber.from("0x2877fe0cf0"),
};

describe("CreditManager calcHealthFactor test", () => {
  it("health factor calculation works correctly", () => {
    const result = calcHealthFactor({
      assets,
      prices,
      liquidationThresholds,
      underlyingToken,
      borrowed,
    });

    expect(result).to.be.eq(1.02);
  });
});
