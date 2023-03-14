import { expect } from "chai";
import { BigNumber } from "ethers";

import { decimals } from "../tokens/decimals";
import { tokenDataByNetwork } from "../tokens/token";
import { toBN } from "../utils/formatter";
import { calcTotalPrice, convertByPrice } from "../utils/price";
import { Asset, AssetUtils } from "./assets";
import { PRICE_DECIMALS_POW } from "./constants";
import { calcHealthFactor } from "./creditManager";

interface CATestInfo {
  assets: Array<Asset>;
  debt: BigNumber;
  underlyingToken: string;
  healthFactor: number;
  underlyingDecimals: number;
}

const liquidationThresholds = {
  [tokenDataByNetwork.Mainnet.DAI.toLowerCase()]: BigNumber.from("9300"),
  [tokenDataByNetwork.Mainnet.WETH.toLowerCase()]: BigNumber.from("8500"),
};

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

const defaultCA: CATestInfo = {
  assets: [
    {
      balance: toBN("156552", decimals.DAI),
      token: tokenDataByNetwork.Mainnet.DAI.toLowerCase(),
    },
    {
      balance: toBN("10", decimals.WETH),
      token: tokenDataByNetwork.Mainnet.WETH.toLowerCase(),
    },
  ],
  debt: toBN("156552", decimals.DAI),
  healthFactor: 10244,
  underlyingToken: tokenDataByNetwork.Mainnet.DAI.toLowerCase(),
  underlyingDecimals: decimals.DAI,
};

describe("CreditManager calcHealthFactor test", () => {
  it("health factor calculation is calculated correctly", () => {
    const result = calcHealthFactor({
      assets: defaultCA.assets,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      borrowed: defaultCA.debt,
    });

    expect(result).to.be.eq(defaultCA.healthFactor);
  });
  it("health factor calculation has no division by zero error", () => {
    const result = calcHealthFactor({
      assets: [],
      prices: {},
      liquidationThresholds: {},
      underlyingToken: "",
      borrowed: BigNumber.from(0),
    });

    expect(result).to.be.eq(0);
  });
  it("health factor after add collateral is calculated  correctly", () => {
    const collateral: Asset = {
      balance: toBN("10", decimals.WETH),
      token: tokenDataByNetwork.Mainnet.WETH.toLowerCase(),
    };

    const afterAdd = AssetUtils.sumAssets(defaultCA.assets, [collateral]);
    const result = calcHealthFactor({
      assets: afterAdd,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      borrowed: defaultCA.debt,
    });

    expect(result).to.be.eq(11188);
  });
  it("health factor after decrease debt is calculated  correctly", () => {
    const amountDecrease = toBN("10000", defaultCA.underlyingDecimals);
    const debtDecrease: Asset = {
      balance: amountDecrease,
      token: defaultCA.underlyingToken,
    };

    const afterDecrease = AssetUtils.subAssets(defaultCA.assets, [
      debtDecrease,
    ]);
    const result = calcHealthFactor({
      assets: afterDecrease,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      borrowed: defaultCA.debt.sub(amountDecrease),
    });

    expect(result).to.be.eq(10308);
  });
  it("health factor after increase debt is calculated  correctly", () => {
    const amountIncrease = toBN("20000", defaultCA.underlyingDecimals);
    const debtIncrease: Asset = {
      balance: amountIncrease,
      token: defaultCA.underlyingToken,
    };

    const afterIncrease = AssetUtils.sumAssets(defaultCA.assets, [
      debtIncrease,
    ]);
    const result = calcHealthFactor({
      assets: afterIncrease,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      borrowed: defaultCA.debt.add(amountIncrease),
    });

    expect(result).to.be.eq(10137);
  });
  it("health factor after swap is calculated  correctly", () => {
    const swapAsset: Asset = {
      balance: defaultCA.debt,
      token: defaultCA.underlyingToken,
    };
    const underlyingPrice = prices[defaultCA.underlyingToken];
    const wethPrice = prices[tokenDataByNetwork.Mainnet.WETH.toLowerCase()];

    const getAmount = convertByPrice(
      calcTotalPrice(
        underlyingPrice,
        defaultCA.debt,
        defaultCA.underlyingDecimals,
      ),
      { price: wethPrice, decimals: decimals.WETH },
    );

    const getAsset: Asset = {
      balance: getAmount,
      token: tokenDataByNetwork.Mainnet.WETH.toLowerCase(),
    };

    const afterSub = AssetUtils.subAssets(defaultCA.assets, [swapAsset]);
    const afterSwap = AssetUtils.sumAssets(afterSub, [getAsset]);

    const result = calcHealthFactor({
      assets: afterSwap,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      borrowed: defaultCA.debt,
    });

    expect(result).to.be.eq(9444);
  });
});
