import {
  decimals,
  PRICE_DECIMALS_POW,
  tokenDataByNetwork,
} from "@gearbox-protocol/sdk-gov";
import { expect } from "chai";

import { LpTokensAPY } from "../apy";
import { toBN } from "../utils/formatter";
import { PriceUtils } from "../utils/price";
import { Asset, AssetUtils } from "./assets";
import {
  CalcOverallAPYProps,
  CalcQuotaUpdateProps,
  CreditAccountData,
} from "./creditAccount";

interface CATestInfo {
  assets: Array<Asset>;
  totalValue: bigint;
  debt: bigint;
  borrowRate: number;
  underlyingToken: string;
  quotas: Record<string, Asset>;
  rates: CalcOverallAPYProps["quotaRates"];
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
  quotas: {
    [tokenDataByNetwork.Mainnet.WETH.toLowerCase()]: {
      balance: toBN("173811.830000", decimals.WETH),
      token: tokenDataByNetwork.Mainnet.DAI.toLowerCase(),
    },
  },
  rates: {
    [tokenDataByNetwork.Mainnet.WETH.toLowerCase()]: {
      rate: 38434,
    },
  },
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
  quotas: {
    [tokenDataByNetwork.Mainnet.STETH.toLowerCase()]: {
      balance: toBN(
        String((1703.87588096 * 119.9999999999999) / 1738.1183),
        decimals.WETH,
      ),
      token: tokenDataByNetwork.Mainnet.STETH.toLowerCase(),
    },
  },
  rates: {
    [tokenDataByNetwork.Mainnet.STETH.toLowerCase()]: {
      rate: 38434,
    },
  },
};

describe("CreditAccount CreditAccountData.calcOverallAPY test", () => {
  it("overall APY calculation for caWithoutLP is correct", () => {
    const result = CreditAccountData.calcOverallAPY({
      caAssets: caWithoutLP.assets,
      totalValue: caWithoutLP.totalValue,
      debt: caWithoutLP.debt,
      baseBorrowRate: caWithoutLP.borrowRate,
      underlyingToken: caWithoutLP.underlyingToken,

      quotaRates: {},
      quotas: {},

      lpAPY,
      prices,
    });

    expect(result).to.be.eq(-6.94841);
  });
  it("overall APY calculation for caWithLP is correct", () => {
    const result = CreditAccountData.calcOverallAPY({
      caAssets: caWithLP.assets,
      totalValue: caWithLP.totalValue,
      debt: caWithLP.debt,
      baseBorrowRate: caWithLP.borrowRate,
      underlyingToken: caWithLP.underlyingToken,

      quotaRates: {},
      quotas: {},

      lpAPY,
      prices,
    });

    expect(result).to.be.eq(14.4919);
  });
  it("overall APY is undefined when !lpAPY", () => {
    const result = CreditAccountData.calcOverallAPY({
      caAssets: caWithLP.assets,
      totalValue: caWithLP.totalValue,
      debt: caWithLP.debt,
      baseBorrowRate: caWithLP.borrowRate,
      underlyingToken: caWithLP.underlyingToken,

      quotaRates: {},
      quotas: {},

      lpAPY: undefined,
      prices,
    });

    expect(result).to.be.eq(undefined);
  });
  it("overall APY is undefined when !totalValue", () => {
    const result = CreditAccountData.calcOverallAPY({
      caAssets: caWithLP.assets,
      totalValue: undefined,
      debt: caWithLP.debt,
      baseBorrowRate: caWithLP.borrowRate,
      underlyingToken: caWithLP.underlyingToken,

      quotaRates: {},
      quotas: {},

      lpAPY,
      prices,
    });

    expect(result).to.be.eq(undefined);
  });
  it("overall APY is undefined when !debt", () => {
    const result = CreditAccountData.calcOverallAPY({
      caAssets: caWithLP.assets,
      totalValue: caWithLP.totalValue,
      debt: undefined,
      baseBorrowRate: caWithLP.borrowRate,
      underlyingToken: caWithLP.underlyingToken,

      quotaRates: {},
      quotas: {},

      lpAPY,
      prices,
    });

    expect(result).to.be.eq(undefined);
  });
  it("overall APY is undefined when totalValue lte 0", () => {
    const result = CreditAccountData.calcOverallAPY({
      caAssets: caWithLP.assets,
      totalValue: 0n,
      debt: undefined,
      baseBorrowRate: caWithLP.borrowRate,
      underlyingToken: caWithLP.underlyingToken,

      quotaRates: {},
      quotas: {},

      lpAPY,
      prices,
    });

    expect(result).to.be.eq(undefined);
  });
  it("overall APY calculation for caWithLP with sufficient quota is correct", () => {
    const result = CreditAccountData.calcOverallAPY({
      caAssets: caWithLP.assets,
      totalValue: caWithLP.totalValue,
      debt: caWithLP.debt,
      baseBorrowRate: caWithLP.borrowRate,
      underlyingToken: caWithLP.underlyingToken,

      quotaRates: caWithLP.rates,
      quotas: caWithLP.quotas,

      lpAPY,
      prices,
    });

    expect(result).to.be.eq(-1.86801);
  });
  it("overall APY calculation for caWithLP with insufficient quota is correct", () => {
    const result = CreditAccountData.calcOverallAPY({
      caAssets: caWithLP.assets,
      totalValue: caWithLP.totalValue,
      debt: caWithLP.debt,
      baseBorrowRate: caWithLP.borrowRate,
      underlyingToken: caWithLP.underlyingToken,

      quotaRates: caWithLP.rates,
      quotas: {
        [tokenDataByNetwork.Mainnet.STETH.toLowerCase()]: {
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.STETH.toLowerCase(),
        },
      },

      lpAPY,
      prices,
    });

    expect(result).to.be.eq(14.4919);
  });
});

describe("CreditAccount calcMaxIncreaseBorrow test", () => {
  it("health max increase borrow is zero if hf < 1", () => {
    const result = CreditAccountData.calcMaxDebtIncrease(
      9999,
      BigInt("156522834253690396032546"),
      9300,
    );
    expect(result.toString()).to.be.eq("0");
  });
  it("health max increase borrow is calculated correctly", () => {
    const result = CreditAccountData.calcMaxDebtIncrease(
      10244,
      BigInt("156522834253690396032546"),
      9300,
    );

    expect(result.toString()).to.be.eq("54559387939857795188487");
  });
  it("health max increase borrow is calculated correctly (low hf, high debt)", () => {
    const loweHf = 10244;

    const result = CreditAccountData.calcMaxDebtIncrease(
      loweHf,
      BigInt("54782991988791638611392"),
      9300,
    );

    expect(result.toString()).to.be.eq("19095785778950228315970");
  });
});

const liquidationThresholds = {
  [tokenDataByNetwork.Mainnet.DAI.toLowerCase()]: 9300n,
  [tokenDataByNetwork.Mainnet.WETH.toLowerCase()]: 8500n,
};

interface CAHfTestInfo {
  assets: Array<Asset>;
  debt: bigint;
  underlyingToken: string;
  healthFactor: number;
  underlyingDecimals: number;
  quotas: Record<string, Asset>;
}

const defaultCA: CAHfTestInfo = {
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
  quotas: {
    [tokenDataByNetwork.Mainnet.WETH.toLowerCase()]: {
      balance: toBN(String(1750 * 10), decimals.DAI),
      token: tokenDataByNetwork.Mainnet.WETH.toLowerCase(),
    },
  },
};

describe("CreditAccount calcHealthFactor test", () => {
  it("health factor is calculated correctly", () => {
    const result = CreditAccountData.calcHealthFactor({
      quotas: {},
      assets: defaultCA.assets,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      borrowed: defaultCA.debt,
    });

    expect(result).to.be.eq(defaultCA.healthFactor);
  });
  it("health factor calculation has no division by zero error", () => {
    const result = CreditAccountData.calcHealthFactor({
      quotas: {},
      assets: [],
      prices: {},
      liquidationThresholds: {},
      underlyingToken: "",
      borrowed: 0n,
    });

    expect(result).to.be.eq(0);
  });
  it("health factor after add collateral is calculated  correctly", () => {
    const collateral: Asset = {
      balance: toBN("10", decimals.WETH),
      token: tokenDataByNetwork.Mainnet.WETH.toLowerCase(),
    };

    const afterAdd = AssetUtils.sumAssets(defaultCA.assets, [collateral]);
    const result = CreditAccountData.calcHealthFactor({
      quotas: {},
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
    const result = CreditAccountData.calcHealthFactor({
      quotas: {},
      assets: afterDecrease,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      borrowed: defaultCA.debt - amountDecrease,
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
    const result = CreditAccountData.calcHealthFactor({
      quotas: {},
      assets: afterIncrease,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      borrowed: defaultCA.debt + amountIncrease,
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

    const getAmount = PriceUtils.convertByPrice(
      PriceUtils.calcTotalPrice(
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

    const result = CreditAccountData.calcHealthFactor({
      quotas: {},
      assets: afterSwap,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      borrowed: defaultCA.debt,
    });

    expect(result).to.be.eq(9444);
  });
  it("health factor with sufficient quotas is calculated correctly", () => {
    const result = CreditAccountData.calcHealthFactor({
      quotas: defaultCA.quotas,
      assets: defaultCA.assets,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      borrowed: defaultCA.debt,
    });

    expect(result).to.be.eq(defaultCA.healthFactor);
  });
  it("health factor with insufficient quotas is calculated correctly", () => {
    const result = CreditAccountData.calcHealthFactor({
      quotas: {
        [tokenDataByNetwork.Mainnet.WETH.toLowerCase()]: {
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.WETH.toLowerCase(),
        },
      },
      assets: defaultCA.assets,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      borrowed: defaultCA.debt,
    });

    expect(result).to.be.eq(9300);
  });
});

const cmQuotas: CalcQuotaUpdateProps["quotas"] = {
  [tokenDataByNetwork.Mainnet.DAI]: {
    token: tokenDataByNetwork.Mainnet.DAI,
    isActive: true,
  },
  [tokenDataByNetwork.Mainnet.WETH]: {
    token: tokenDataByNetwork.Mainnet.WETH,
    isActive: true,
  },
  [tokenDataByNetwork.Mainnet.STETH]: {
    token: tokenDataByNetwork.Mainnet.STETH,
    isActive: true,
  },
};

const caQuota: CalcQuotaUpdateProps["initialQuotas"] = {
  [tokenDataByNetwork.Mainnet.DAI]: {
    quota: 5n,
  },
  [tokenDataByNetwork.Mainnet.WETH]: {
    quota: 10n,
  },
};

describe("CreditAccount calcQuotaUpdate test", () => {
  it("open account should buy quota", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      quotas: cmQuotas,
      initialQuotas: {},
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.DAI]: {
          amountInTarget: 10n,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          amountInTarget: 20n,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.WETH,
        },
      },

      allowedToObtain: {
        [tokenDataByNetwork.Mainnet.DAI]: {},
        [tokenDataByNetwork.Mainnet.WETH]: {},
      },
      allowedToSpend: {},
    });

    expect(result.quotaIncrease).to.be.deep.eq([
      {
        balance: 10n,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      {
        balance: 20n,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
    ]);
    expect(result.quotaDecrease).to.be.deep.eq([]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 10n,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 20n,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 0n,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
  it("add collateral should buy quota", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      quotas: cmQuotas,
      initialQuotas: caQuota,
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.STETH]: {
          amountInTarget: 10n,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
      },

      allowedToObtain: {
        [tokenDataByNetwork.Mainnet.STETH]: {},
      },
      allowedToSpend: {},
    });

    expect(result.quotaIncrease).to.be.deep.eq([
      {
        balance: 10n,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    ]);
    expect(result.quotaDecrease).to.be.deep.eq([]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 5n,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 10n,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 10n,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
  it("add collateral should add additional quota", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      quotas: cmQuotas,
      initialQuotas: caQuota,
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.DAI]: {
          amountInTarget: 10n,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
      },

      allowedToObtain: {
        [tokenDataByNetwork.Mainnet.DAI]: {},
      },
      allowedToSpend: {},
    });

    expect(result.quotaIncrease).to.be.deep.eq([
      {
        balance: 5n,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
    ]);
    expect(result.quotaDecrease).to.be.deep.eq([]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 10n,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 10n,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 0n,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
  it("add collateral shouldn't add additional quota", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      quotas: cmQuotas,
      initialQuotas: caQuota,
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.WETH]: {
          amountInTarget: 10n,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.WETH,
        },
      },

      allowedToObtain: {
        [tokenDataByNetwork.Mainnet.WETH]: {},
      },
      allowedToSpend: {},
    });

    expect(result.quotaIncrease).to.be.deep.eq([]);
    expect(result.quotaDecrease).to.be.deep.eq([]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 5n,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 10n,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 0n,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
  it("swap should buy quota", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      quotas: cmQuotas,
      initialQuotas: caQuota,
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.STETH]: {
          amountInTarget: 10n,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          amountInTarget: 0n,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
      },

      allowedToObtain: {
        [tokenDataByNetwork.Mainnet.STETH]: {},
      },
      allowedToSpend: { [tokenDataByNetwork.Mainnet.WETH]: {} },
    });

    expect(result.quotaIncrease).to.be.deep.eq([
      {
        balance: 10n,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    ]);
    expect(result.quotaDecrease).to.be.deep.eq([
      { balance: -10n, token: tokenDataByNetwork.Mainnet.WETH },
    ]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 5n,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 0n,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 10n,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
  it("swap should add additional quota", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      quotas: cmQuotas,
      initialQuotas: caQuota,
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.DAI]: {
          amountInTarget: 10n,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          amountInTarget: 0n,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.WETH,
        },
      },

      allowedToObtain: {
        [tokenDataByNetwork.Mainnet.DAI]: {},
      },
      allowedToSpend: {
        [tokenDataByNetwork.Mainnet.WETH]: {},
      },
    });

    expect(result.quotaIncrease).to.be.deep.eq([
      {
        balance: 5n,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
    ]);
    expect(result.quotaDecrease).to.be.deep.eq([
      {
        balance: -10n,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
    ]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 10n,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 0n,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 0n,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
  it("swap shouldn't add additional quota", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      quotas: cmQuotas,
      initialQuotas: caQuota,
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.WETH]: {
          amountInTarget: 10n,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.WETH,
        },
        [tokenDataByNetwork.Mainnet.DAI]: {
          amountInTarget: 0n,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
      },

      allowedToObtain: {
        [tokenDataByNetwork.Mainnet.WETH]: {},
      },
      allowedToSpend: { [tokenDataByNetwork.Mainnet.DAI]: {} },
    });

    expect(result.quotaIncrease).to.be.deep.eq([]);
    expect(result.quotaDecrease).to.be.deep.eq([
      {
        balance: -5n,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
    ]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 0n,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 10n,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 0n,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
  it("shouldn't change quota if disallowed", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      quotas: cmQuotas,
      initialQuotas: caQuota,
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.WETH]: {
          amountInTarget: 10n,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.WETH,
        },
        [tokenDataByNetwork.Mainnet.DAI]: {
          amountInTarget: 0n,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
      },

      allowedToObtain: {},
      allowedToSpend: {},
    });

    expect(result.quotaIncrease).to.be.deep.eq([]);
    expect(result.quotaDecrease).to.be.deep.eq([]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 5n,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 10n,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 0n,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
});
