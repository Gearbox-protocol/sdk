import { expect } from "chai";

import { LpTokensAPY } from "../apy";
import { decimals } from "../tokens/decimals";
import { tokenDataByNetwork } from "../tokens/token";
import { toBN } from "../utils/formatter";
import { Asset } from "./assets";
import { PRICE_DECIMALS_POW } from "./constants";
import { calcOverallAPY, CreditAccountData } from "./creditAccount";

interface CATestInfo {
  assets: Array<Asset>;
  totalValue: bigint;
  debt: bigint;
  borrowRate: number;
  underlyingToken: string;
}

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

const lpAPY = { STETH: 38434 } as LpTokensAPY;

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
  borrowRate: 7712,
  underlyingToken: tokenDataByNetwork.Mainnet.DAI.toLowerCase(),
};

const caWithLP: CATestInfo = {
  assets: [
    {
      balance: toBN("119.999999999999999997", decimals.STETH),
      token: tokenDataByNetwork.Mainnet.STETH.toLowerCase(),
    },
    {
      balance: toBN("3.5", decimals.WETH),
      token: tokenDataByNetwork.Mainnet.WETH.toLowerCase(),
    },
  ],
  totalValue: toBN("117.635897231615362429", decimals.WETH),
  debt: toBN("90.000000000000000000", decimals.WETH),
  borrowRate: 5736,
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

    expect(result).to.be.eq(14.4919);
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
      totalValue: 0n,
      debt: undefined,
      borrowRate: caWithLP.borrowRate,
      underlyingToken: caWithLP.underlyingToken,

      lpAPY,
      prices,
    });

    expect(result).to.be.eq(undefined);
  });
});

describe("CreditAccount calcMaxIncreaseBorrow test", () => {
  it("health max increase borrow is zero if hf < 1", () => {
    const result = CreditAccountData.calcMaxIncreaseBorrow(
      9999,
      BigInt("156522834253690396032546"),
      0,
      9300,
    );
    expect(result.toString()).to.be.eq("0");
  });
  it("health max increase borrow is calculated correctly", () => {
    const result = CreditAccountData.calcMaxIncreaseBorrow(
      10244,
      BigInt("156522834253690396032546"),
      0,
      9300,
    );

    expect(result.toString()).to.be.eq("54559387939857795188487");
  });
  it("health max increase borrow is calculated correctly (low hf, high debt)", () => {
    const loweHf = 10244;

    const result = CreditAccountData.calcMaxIncreaseBorrow(
      loweHf,
      BigInt("54782991988791638611392"),
      0,
      9300,
    );

    expect(result.toString()).to.be.eq("19095785778950228315970");
  });
});
