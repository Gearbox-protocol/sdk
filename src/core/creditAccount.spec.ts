import { expect } from "chai";
import { BigNumber } from "ethers";

import { LpTokensAPY } from "../apy";
import { decimals } from "../tokens/decimals";
import { tokenDataByNetwork } from "../tokens/token";
import { toBN } from "../utils/formatter";
import { Asset } from "./assets";
import { calcOverallAPY } from "./creditAccount";

interface CATestInfo {
  assets: Array<Asset>;
  totalValue: BigNumber;
  debt: BigNumber;
  borrowRate: number;
  underlyingToken: string;
}

const prices = {
  [tokenDataByNetwork.Mainnet.WETH.toLowerCase()]:
    BigNumber.from("0x2877fe0cf0"),
  [tokenDataByNetwork.Mainnet.DAI.toLowerCase()]: BigNumber.from("0x05f4faef"),
  [tokenDataByNetwork.Mainnet.STETH.toLowerCase()]:
    BigNumber.from("0x27abe44400"),
};

const lpAPY = { STETH: 3.84345 } as LpTokensAPY;

const caWithoutLP: CATestInfo = {
  assets: [
    {
      balance: toBN("54780", decimals.DAI),
      token: tokenDataByNetwork.Mainnet.DAI.toLowerCase(),
    },
    {
      balance: toBN("3.5", decimals.WETH),
      token: tokenDataByNetwork.Mainnet.WETH.toLowerCase(),
    },
  ],
  totalValue: toBN("60860", decimals.DAI),
  debt: toBN("54780", decimals.DAI),
  borrowRate: 0.7712,
  underlyingToken: tokenDataByNetwork.Mainnet.DAI.toLowerCase(),
};

const caWithLP: CATestInfo = {
  assets: [
    {
      balance: BigNumber.from("0x068155a43676dffffd"),
      token: tokenDataByNetwork.Mainnet.STETH.toLowerCase(),
    },
    {
      balance: toBN("3.5", decimals.WETH),
      token: tokenDataByNetwork.Mainnet.WETH.toLowerCase(),
    },
  ],
  totalValue: BigNumber.from("0x066086a9453cca857d"),
  debt: BigNumber.from("0x04e1003b28d9280000"),
  borrowRate: 0.5736,
  underlyingToken: tokenDataByNetwork.Mainnet.WETH.toLowerCase(),
};

describe("CreditAccount calcOverallAPY test", () => {
  it("overall APY calculation for caWithoutLP is correct", () => {
    const result = calcOverallAPY({
      caAssets: caWithoutLP.assets,
      totalValue: caWithoutLP.totalValue,
      debt: caWithoutLP.debt,
      borrowRate: caWithoutLP.borrowRate,
      underlyingToken: caWithoutLP.underlyingToken,

      lpAPY,
      prices,
    });

    expect(result).to.be.eq(-6.94841);
  });
  it("overall APY calculation for caWithLP is correct", () => {
    const result = calcOverallAPY({
      caAssets: caWithLP.assets,
      totalValue: caWithLP.totalValue,
      debt: caWithLP.debt,
      borrowRate: caWithLP.borrowRate,
      underlyingToken: caWithLP.underlyingToken,

      lpAPY,
      prices,
    });

    expect(result).to.be.eq(14.4922);
  });
  it("overall APY is undefined when !lpAPY", () => {
    const result = calcOverallAPY({
      caAssets: caWithLP.assets,
      totalValue: caWithLP.totalValue,
      debt: caWithLP.debt,
      borrowRate: caWithLP.borrowRate,
      underlyingToken: caWithLP.underlyingToken,

      lpAPY: undefined,
      prices,
    });

    expect(result).to.be.eq(undefined);
  });
  it("overall APY is undefined when !totalValue", () => {
    const result = calcOverallAPY({
      caAssets: caWithLP.assets,
      totalValue: undefined,
      debt: caWithLP.debt,
      borrowRate: caWithLP.borrowRate,
      underlyingToken: caWithLP.underlyingToken,

      lpAPY,
      prices,
    });

    expect(result).to.be.eq(undefined);
  });
  it("overall APY is undefined when !debt", () => {
    const result = calcOverallAPY({
      caAssets: caWithLP.assets,
      totalValue: caWithLP.totalValue,
      debt: undefined,
      borrowRate: caWithLP.borrowRate,
      underlyingToken: caWithLP.underlyingToken,

      lpAPY,
      prices,
    });

    expect(result).to.be.eq(undefined);
  });
  it("overall APY is undefined when totalValue lte 0", () => {
    const result = calcOverallAPY({
      caAssets: caWithLP.assets,
      totalValue: BigNumber.from(0),
      debt: undefined,
      borrowRate: caWithLP.borrowRate,
      underlyingToken: caWithLP.underlyingToken,

      lpAPY,
      prices,
    });

    expect(result).to.be.eq(undefined);
  });
});
