import { expect } from "chai";
import { BigNumber } from "ethers";

import { decimals } from "../tokens/decimals";
import { tokenDataByNetwork } from "../tokens/token";
import { toBN } from "../utils/formatter";
import { calcTotalPrice, convertByPrice } from "../utils/price";
import { Asset, subAssets, sumAssets } from "./assets";
import { calcHealthFactor, calcMaxIncreaseBorrow } from "./creditManager";

const collateralToken = tokenDataByNetwork.Mainnet.WETH.toLowerCase();
const collateralDecimals = decimals.WETH;

const underlyingToken = tokenDataByNetwork.Mainnet.DAI.toLowerCase();
const underlyingDecimals = decimals.DAI;
const borrowed = toBN("156552", underlyingDecimals);

const assets: Array<Asset> = [
  {
    balance: borrowed,
    token: underlyingToken,
  },
  {
    balance: toBN("10", decimals.WETH),
    token: collateralToken,
  },
];

const liquidationThresholds = {
  [underlyingToken]: BigNumber.from("0x2454"),
  [collateralToken]: BigNumber.from("0x2134"),
};

const prices = {
  [underlyingToken]: BigNumber.from("0x05f4faef"),
  [collateralToken]: BigNumber.from("0x2877fe0cf0"),
};

const currentHF = 10244;

describe("CreditManager calcHealthFactor test", () => {
  it("health factor calculation is calculated correctly", () => {
    const result = calcHealthFactor({
      assets,
      prices,
      liquidationThresholds,
      underlyingToken,
      borrowed,
    });

    expect(result).to.be.eq(currentHF);
  });
  it("health factor after add collateral is calculated  correctly", () => {
    const collateral: Asset = {
      balance: toBN("10", collateralDecimals),
      token: collateralToken,
    };

    const afterAdd = sumAssets(assets, [collateral]);
    const result = calcHealthFactor({
      assets: afterAdd,
      prices,
      liquidationThresholds,
      underlyingToken,
      borrowed,
    });

    expect(result).to.be.eq(11188);
  });
  it("health factor after decrease debt is calculated  correctly", () => {
    const amountDecrease = toBN("10000", underlyingDecimals);
    const debtDecrease: Asset = {
      balance: amountDecrease,
      token: underlyingToken,
    };

    const afterDecrease = subAssets(assets, [debtDecrease]);
    const result = calcHealthFactor({
      assets: afterDecrease,
      prices,
      liquidationThresholds,
      underlyingToken,
      borrowed: borrowed.sub(amountDecrease),
    });

    expect(result).to.be.eq(10308);
  });
  it("health factor after increase debt is calculated  correctly", () => {
    const amountIncrease = toBN("20000", underlyingDecimals);
    const debtIncrease: Asset = {
      balance: amountIncrease,
      token: underlyingToken,
    };

    const afterIncrease = sumAssets(assets, [debtIncrease]);
    const result = calcHealthFactor({
      assets: afterIncrease,
      prices,
      liquidationThresholds,
      underlyingToken,
      borrowed: borrowed.add(amountIncrease),
    });

    expect(result).to.be.eq(10137);
  });
  it("health factor after swap is calculated  correctly", () => {
    const swapAsset: Asset = {
      balance: borrowed,
      token: underlyingToken,
    };
    const underlyingPrice = prices[underlyingToken];
    const wethPrice = prices[collateralToken];

    const getAmount = convertByPrice(
      calcTotalPrice(underlyingPrice, borrowed, underlyingDecimals),
      { price: wethPrice, decimals: collateralDecimals },
    );

    const getAsset: Asset = {
      balance: getAmount,
      token: collateralToken,
    };

    const afterSub = subAssets(assets, [swapAsset]);
    const afterSwap = sumAssets(afterSub, [getAsset]);

    const result = calcHealthFactor({
      assets: afterSwap,
      prices,
      liquidationThresholds,
      underlyingToken,
      borrowed: borrowed,
    });

    expect(result).to.be.eq(9444);
  });
});

describe("CreditManager calcMaxIncreaseBorrow test", () => {
  it("health factor calculation is calculated correctly", () => {
    const result = calcMaxIncreaseBorrow(
      currentHF,
      BigNumber.from("156522834253690396032546"),
      0,
    );

    expect(result.toString()).to.be.eq(
      BigNumber.from("54559387939857795188487").toString(),
    );
  });
  it("health factor calculation is calculated correctly (low hf, high debt)", () => {
    const loweHf = 10244;

    const result = calcMaxIncreaseBorrow(
      loweHf,
      BigNumber.from("54782991988791638611392"),
      0,
    );

    expect(result.toString()).to.be.eq(
      BigNumber.from("19095785778950228315970").toString(),
    );
  });
});
