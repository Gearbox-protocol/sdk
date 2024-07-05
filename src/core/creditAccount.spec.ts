import {
  Address,
  decimals,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS_POW,
  tokenDataByNetwork,
} from "@gearbox-protocol/sdk-gov";
import { expect } from "chai";

import { TokensWithApyRecord } from "../apy";
import { toBN } from "../utils/formatter";
import { PriceUtils } from "../utils/price";
import { Asset, AssetUtils } from "./assets";
import {
  CalcHealthFactorProps,
  CalcOverallAPYProps,
  CalcQuotaUpdateProps,
  CreditAccountData,
  MIN_INT96,
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
  [tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address]: toBN(
    "1738.11830000",
    PRICE_DECIMALS_POW,
  ),
  [tokenDataByNetwork.Mainnet.DAI.toLowerCase() as Address]: toBN(
    "0.99941103",
    PRICE_DECIMALS_POW,
  ),
  [tokenDataByNetwork.Mainnet.USDC.toLowerCase() as Address]: toBN(
    "0.999",
    PRICE_DECIMALS_POW,
  ),
  [tokenDataByNetwork.Mainnet.STETH.toLowerCase() as Address]: toBN(
    "1703.87588096",
    PRICE_DECIMALS_POW,
  ),
};

const lpAPY = { STETH: 38434 } as TokensWithApyRecord;

const caWithoutLP: CATestInfo = {
  assets: [
    {
      balance: toBN("54780", decimals.DAI),
      token: tokenDataByNetwork.Mainnet.DAI.toLowerCase() as Address,
    },
    {
      balance: toBN("3.5", decimals.WETH),
      token: tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address,
    },
  ],
  totalValue: toBN("60860", decimals.DAI),
  debt: toBN("54780", decimals.DAI),
  borrowRate: 7712,
  underlyingToken: tokenDataByNetwork.Mainnet.DAI.toLowerCase() as Address,
  quotas: {
    [tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address]: {
      balance: toBN("173811.830000", decimals.WETH),
      token: tokenDataByNetwork.Mainnet.DAI.toLowerCase() as Address,
    },
  },
  rates: {
    [tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address]: {
      rate: 38434n,
      isActive: true,
    },
  },
};

const caWithLP: CATestInfo = {
  assets: [
    {
      balance: toBN("119.999999999999999997", decimals.STETH),
      token: tokenDataByNetwork.Mainnet.STETH.toLowerCase() as Address,
    },
    {
      balance: toBN("3.5", decimals.WETH),
      token: tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address,
    },
  ],
  totalValue: toBN("117.635897231615362429", decimals.WETH),
  debt: toBN("90.000000000000000000", decimals.WETH),
  borrowRate: 5736,
  underlyingToken: tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address,
  quotas: {
    [tokenDataByNetwork.Mainnet.STETH.toLowerCase() as Address]: {
      balance: toBN(
        String((1703.87588096 * 119.9999999999999) / 1738.1183),
        decimals.WETH,
      ),
      token: tokenDataByNetwork.Mainnet.STETH.toLowerCase() as Address,
    },
  },
  rates: {
    [tokenDataByNetwork.Mainnet.STETH.toLowerCase() as Address]: {
      rate: 38434n,
      isActive: true,
    },
  },
};

describe("CreditAccount CreditAccountData.calcOverallAPY test", () => {
  it("overall APY calculation for caWithoutLP is correct", () => {
    const result = CreditAccountData.calcOverallAPY({
      caAssets: caWithoutLP.assets,
      totalValue: caWithoutLP.totalValue,
      debt: caWithoutLP.debt,
      baseRateWithFee: caWithoutLP.borrowRate,
      underlyingToken: caWithoutLP.underlyingToken,

      quotaRates: {},
      quotas: {},
      feeInterest: 0,

      lpAPY,
      prices,
    });

    expect(result).to.be.eq(-69484n);
  });
  it("overall APY calculation for caWithLP is correct", () => {
    const result = CreditAccountData.calcOverallAPY({
      caAssets: caWithLP.assets,
      totalValue: caWithLP.totalValue,
      debt: caWithLP.debt,
      baseRateWithFee: caWithLP.borrowRate,
      underlyingToken: caWithLP.underlyingToken,

      quotaRates: {},
      quotas: {},
      feeInterest: 0,

      lpAPY,
      prices,
    });

    expect(result).to.be.eq(144919n);
  });
  it("overall APY is undefined when !lpAPY", () => {
    const result = CreditAccountData.calcOverallAPY({
      caAssets: caWithLP.assets,
      totalValue: caWithLP.totalValue,
      debt: caWithLP.debt,
      baseRateWithFee: caWithLP.borrowRate,
      underlyingToken: caWithLP.underlyingToken,

      quotaRates: {},
      quotas: {},
      feeInterest: 0,

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
      baseRateWithFee: caWithLP.borrowRate,
      underlyingToken: caWithLP.underlyingToken,

      quotaRates: {},
      quotas: {},
      feeInterest: 0,

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
      baseRateWithFee: caWithLP.borrowRate,
      underlyingToken: caWithLP.underlyingToken,

      quotaRates: {},
      quotas: {},
      feeInterest: 0,

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
      baseRateWithFee: caWithLP.borrowRate,
      underlyingToken: caWithLP.underlyingToken,

      quotaRates: {},
      quotas: {},
      feeInterest: 0,

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
      baseRateWithFee: caWithLP.borrowRate,
      underlyingToken: caWithLP.underlyingToken,

      quotaRates: caWithLP.rates,
      quotas: caWithLP.quotas,
      feeInterest: 0,

      lpAPY,
      prices,
    });

    expect(result).to.be.eq(-18680n);
  });
  it("overall APY calculation for caWithLP with insufficient quota is correct", () => {
    const result = CreditAccountData.calcOverallAPY({
      caAssets: caWithLP.assets,
      totalValue: caWithLP.totalValue,
      debt: caWithLP.debt,
      baseRateWithFee: caWithLP.borrowRate,
      underlyingToken: caWithLP.underlyingToken,

      quotaRates: caWithLP.rates,
      quotas: {
        [tokenDataByNetwork.Mainnet.STETH.toLowerCase() as Address]: {
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.STETH.toLowerCase() as Address,
        },
      },
      feeInterest: 0,

      lpAPY,
      prices,
    });

    expect(result).to.be.eq(144919n);
  });
});

describe("CreditAccount calcMaxDebtIncrease test", () => {
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
  [tokenDataByNetwork.Mainnet.USDC.toLowerCase() as Address]: 9800n,
  [tokenDataByNetwork.Mainnet.DAI.toLowerCase() as Address]: 9300n,
  [tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address]: 8500n,
  [tokenDataByNetwork.Mainnet.STETH.toLowerCase() as Address]: 8000n,
};

describe("CreditAccount calcMaxLendingDebt test", () => {
  it("calcMaxLendingDebt for several collaterals with zero lt", () => {
    const result = CreditAccountData.calcMaxLendingDebt({
      assets: [
        {
          token: tokenDataByNetwork.Mainnet.DAI.toLowerCase() as Address,
          balance: toBN("1000", decimals.DAI),
        },
        {
          token: tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address,
          balance: toBN("1", decimals.WETH),
        },
      ],
      liquidationThresholds: {
        ...liquidationThresholds,
        [tokenDataByNetwork.Mainnet.DAI.toLowerCase() as Address]: 0n,
      },
      underlyingToken: tokenDataByNetwork.Mainnet.USDC.toLowerCase() as Address,
      prices: {
        [tokenDataByNetwork.Mainnet.DAI.toLowerCase() as Address]: 1n,
        [tokenDataByNetwork.Mainnet.USDC.toLowerCase() as Address]: 1n,
        [tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address]: 1000n,
      },
    });
    expect(result).to.be.eq(toBN("850", decimals.USDC));
  });
  it("calcMaxLendingDebt for several collaterals with zero underlying price", () => {
    const result = CreditAccountData.calcMaxLendingDebt({
      assets: [
        {
          token: tokenDataByNetwork.Mainnet.DAI.toLowerCase() as Address,
          balance: toBN("1000", decimals.DAI),
        },
        {
          token: tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address,
          balance: toBN("1", decimals.WETH),
        },
      ],
      liquidationThresholds: liquidationThresholds,
      underlyingToken: tokenDataByNetwork.Mainnet.USDC.toLowerCase() as Address,
      prices: {
        [tokenDataByNetwork.Mainnet.DAI.toLowerCase() as Address]: 1n,
        [tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address]: 1000n,
      },
    });
    expect(result).to.be.eq(0n);
  });
  it("calcMaxLendingDebt for simplest case", () => {
    const result = CreditAccountData.calcMaxLendingDebt({
      assets: [
        {
          token: tokenDataByNetwork.Mainnet.DAI.toLowerCase() as Address,
          balance: toBN("1000", decimals.DAI),
        },
      ],
      liquidationThresholds,
      underlyingToken: tokenDataByNetwork.Mainnet.USDC.toLowerCase() as Address,
      prices: {
        [tokenDataByNetwork.Mainnet.DAI.toLowerCase() as Address]: 1n,
        [tokenDataByNetwork.Mainnet.USDC.toLowerCase() as Address]: 1n,
      },
    });
    expect(result).to.be.eq(toBN("930", decimals.USDC));
  });
  it("calcMaxLendingDebt for several collaterals", () => {
    const result = CreditAccountData.calcMaxLendingDebt({
      assets: [
        {
          token: tokenDataByNetwork.Mainnet.DAI.toLowerCase() as Address,
          balance: toBN("1000", decimals.DAI),
        },
        {
          token: tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address,
          balance: toBN("1", decimals.WETH),
        },
      ],
      liquidationThresholds,
      underlyingToken: tokenDataByNetwork.Mainnet.USDC.toLowerCase() as Address,
      prices: {
        [tokenDataByNetwork.Mainnet.DAI.toLowerCase() as Address]: 1n,
        [tokenDataByNetwork.Mainnet.USDC.toLowerCase() as Address]: 1n,
        [tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address]: 1000n,
      },
    });
    expect(result).to.be.eq(toBN("1780", decimals.USDC));
  });
  it("calcMaxLendingDebt for several collaterals with target HF", () => {
    const result = CreditAccountData.calcMaxLendingDebt({
      assets: [
        {
          token: tokenDataByNetwork.Mainnet.DAI.toLowerCase() as Address,
          balance: toBN("1000", decimals.DAI),
        },
        {
          token: tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address,
          balance: toBN("1", decimals.WETH),
        },
      ],
      liquidationThresholds,
      underlyingToken: tokenDataByNetwork.Mainnet.USDC.toLowerCase() as Address,
      prices: {
        [tokenDataByNetwork.Mainnet.DAI.toLowerCase() as Address]: 1n,
        [tokenDataByNetwork.Mainnet.USDC.toLowerCase() as Address]: 1n,
        [tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address]: 1000n,
      },
      targetHF: 12500n,
    });
    expect(result).to.be.eq(toBN("1424", decimals.USDC));
  });
});

interface CAHfTestInfo {
  assets: Array<Asset>;
  debt: bigint;
  underlyingToken: string;
  healthFactor: number;
  underlyingDecimals: number;
  quotas: Record<string, Asset>;
  quotasInfo: CalcHealthFactorProps["quotasInfo"];
}

const defaultCA: CAHfTestInfo = {
  assets: [
    {
      balance: toBN("156552", decimals.DAI),
      token: tokenDataByNetwork.Mainnet.DAI.toLowerCase() as Address,
    },
    {
      balance: toBN("10", decimals.WETH),
      token: tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address,
    },
  ],
  debt: toBN("156552", decimals.DAI),
  healthFactor: 10244,
  underlyingToken: tokenDataByNetwork.Mainnet.DAI.toLowerCase() as Address,
  underlyingDecimals: decimals.DAI,
  quotas: {
    [tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address]: {
      balance: toBN(String(1750 * 10), decimals.DAI),
      token: tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address,
    },
  },
  quotasInfo: {
    [tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address]: {
      isActive: true,
    },
  },
};

describe("CreditAccount calcHealthFactor test", () => {
  it("health factor is calculated correctly", () => {
    const result = CreditAccountData.calcHealthFactor({
      quotas: {},
      quotasInfo: {},
      assets: defaultCA.assets,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      debt: defaultCA.debt,
    });

    expect(result).to.be.eq(defaultCA.healthFactor);
  });
  it("health factor calculation has no division by zero error", () => {
    const result = CreditAccountData.calcHealthFactor({
      quotas: {},
      quotasInfo: {},
      assets: [],
      prices: {},
      liquidationThresholds: {},
      underlyingToken: "",
      debt: 0n,
    });

    expect(result).to.be.eq(65535);
  });
  it("health factor after add collateral is calculated  correctly", () => {
    const collateral: Asset = {
      balance: toBN("10", decimals.WETH),
      token: tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address,
    };

    const afterAdd = AssetUtils.sumAssets(defaultCA.assets, [collateral]);
    const result = CreditAccountData.calcHealthFactor({
      quotas: {},
      quotasInfo: {},
      assets: afterAdd,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      debt: defaultCA.debt,
    });

    expect(result).to.be.eq(11188);
  });
  it("health factor after decrease debt is calculated  correctly", () => {
    const amountDecrease = toBN("10000", defaultCA.underlyingDecimals);
    const debtDecrease: Asset = {
      balance: amountDecrease,
      token: defaultCA.underlyingToken as Address,
    };

    const afterDecrease = AssetUtils.subAssets(defaultCA.assets, [
      debtDecrease,
    ]);
    const result = CreditAccountData.calcHealthFactor({
      quotas: {},
      quotasInfo: {},
      assets: afterDecrease,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      debt: defaultCA.debt - amountDecrease,
    });

    expect(result).to.be.eq(10308);
  });
  it("health factor after increase debt is calculated  correctly", () => {
    const amountIncrease = toBN("20000", defaultCA.underlyingDecimals);
    const debtIncrease: Asset = {
      balance: amountIncrease,
      token: defaultCA.underlyingToken as Address,
    };

    const afterIncrease = AssetUtils.sumAssets(defaultCA.assets, [
      debtIncrease,
    ]);
    const result = CreditAccountData.calcHealthFactor({
      quotas: {},
      quotasInfo: {},
      assets: afterIncrease,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      debt: defaultCA.debt + amountIncrease,
    });

    expect(result).to.be.eq(10137);
  });
  it("health factor after swap is calculated  correctly", () => {
    const swapAsset: Asset = {
      balance: defaultCA.debt,
      token: defaultCA.underlyingToken as Address,
    };
    const underlyingPrice = prices[defaultCA.underlyingToken];
    const wethPrice =
      prices[tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address];

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
      token: tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address,
    };

    const afterSub = AssetUtils.subAssets(defaultCA.assets, [swapAsset]);
    const afterSwap = AssetUtils.sumAssets(afterSub, [getAsset]);

    const result = CreditAccountData.calcHealthFactor({
      quotas: {},
      quotasInfo: {},
      assets: afterSwap,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      debt: defaultCA.debt,
    });

    expect(result).to.be.eq(9444);
  });
  it("health factor with sufficient quotas is calculated correctly", () => {
    const result = CreditAccountData.calcHealthFactor({
      quotas: defaultCA.quotas,
      quotasInfo: defaultCA.quotasInfo,
      assets: defaultCA.assets,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      debt: defaultCA.debt,
    });

    expect(result).to.be.eq(defaultCA.healthFactor);
  });
  it("health factor with insufficient quotas is calculated correctly", () => {
    const result = CreditAccountData.calcHealthFactor({
      quotas: {
        [tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address]: {
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address,
        },
      },
      quotasInfo: defaultCA.quotasInfo,
      assets: defaultCA.assets,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      debt: defaultCA.debt,
    });

    expect(result).to.be.eq(9300);
  });
  it("health factor with disabled quota is calculated correctly", () => {
    const result = CreditAccountData.calcHealthFactor({
      quotas: defaultCA.quotas,
      quotasInfo: {
        [tokenDataByNetwork.Mainnet.WETH.toLowerCase() as Address]: {
          isActive: false,
        },
      },
      assets: defaultCA.assets,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      debt: defaultCA.debt,
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
    quota: 5n * PERCENTAGE_FACTOR,
  },
  [tokenDataByNetwork.Mainnet.WETH]: {
    quota: 10n * PERCENTAGE_FACTOR,
  },
};

const QUOTA_RESERVE = 100n;
const DEFAULT_LT = {
  [tokenDataByNetwork.Mainnet.DAI]: PERCENTAGE_FACTOR,
  [tokenDataByNetwork.Mainnet.WETH]: PERCENTAGE_FACTOR,
  [tokenDataByNetwork.Mainnet.STETH]: PERCENTAGE_FACTOR,
};
const HUGE_MAX_DEBT = 20n * PERCENTAGE_FACTOR;

describe("CreditAccount calcQuotaUpdate test", () => {
  it("open account should buy quota", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: {},
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.DAI]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          amountInTarget: 20n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.WETH,
        },
      },

      allowedToObtain: {
        [tokenDataByNetwork.Mainnet.DAI]: {},
        [tokenDataByNetwork.Mainnet.WETH]: {},
      },
      allowedToSpend: {},

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).to.be.deep.eq([
      {
        balance: 10n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      {
        balance: 20n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
    ]);
    expect(result.quotaDecrease).to.be.deep.eq([]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 20n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
  it("add collateral should buy quota", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: caQuota,
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.STETH]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
      },

      allowedToObtain: {
        [tokenDataByNetwork.Mainnet.STETH]: {},
      },
      allowedToSpend: {},

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).to.be.deep.eq([
      {
        balance: 10n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    ]);
    expect(result.quotaDecrease).to.be.deep.eq([]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
  it("add collateral should add additional quota", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: caQuota,
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.DAI]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
      },

      allowedToObtain: {
        [tokenDataByNetwork.Mainnet.DAI]: {},
      },
      allowedToSpend: {},

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).to.be.deep.eq([
      {
        balance: 5n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
    ]);
    expect(result.quotaDecrease).to.be.deep.eq([]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
  it("add collateral shouldn't add additional quota", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: caQuota,
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.WETH]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.WETH,
        },
      },

      allowedToObtain: {
        [tokenDataByNetwork.Mainnet.WETH]: {},
      },
      allowedToSpend: {},

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).to.be.deep.eq([]);
    expect(result.quotaDecrease).to.be.deep.eq([]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
  it("swap should buy quota", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: caQuota,
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.STETH]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          amountInTarget: 0n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
      },

      allowedToObtain: {
        [tokenDataByNetwork.Mainnet.STETH]: {},
      },
      allowedToSpend: { [tokenDataByNetwork.Mainnet.WETH]: {} },

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).to.be.deep.eq([
      {
        balance: 10n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    ]);
    expect(result.quotaDecrease).to.be.deep.eq([
      {
        balance: MIN_INT96,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
    ]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
  it("swap should buy additional quota", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: caQuota,
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.DAI]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          amountInTarget: 0n * PERCENTAGE_FACTOR,
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

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).to.be.deep.eq([
      {
        balance: 5n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
    ]);
    expect(result.quotaDecrease).to.be.deep.eq([
      {
        balance: MIN_INT96,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
    ]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
  it("swap should buy additional quota with respect to debt", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: caQuota,
      calcModification: {
        debt: 7n * PERCENTAGE_FACTOR,
        type: "recommendedQuota",
      },
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.DAI]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          amountInTarget: 0n * PERCENTAGE_FACTOR,
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

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).to.be.deep.eq([
      {
        balance: 2n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
    ]);
    expect(result.quotaDecrease).to.be.deep.eq([
      {
        balance: MIN_INT96,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
    ]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 7n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
  it("swap shouldn't buy additional quota", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: caQuota,
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.WETH]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.WETH,
        },
        [tokenDataByNetwork.Mainnet.DAI]: {
          amountInTarget: 0n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
      },

      allowedToObtain: {
        [tokenDataByNetwork.Mainnet.WETH]: {},
      },
      allowedToSpend: { [tokenDataByNetwork.Mainnet.DAI]: {} },

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).to.be.deep.eq([]);
    expect(result.quotaDecrease).to.be.deep.eq([
      {
        balance: MIN_INT96,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
    ]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
  it("shouldn't change quota if disallowed", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: caQuota,
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.DAI]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          amountInTarget: 0n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.WETH,
        },
      },

      allowedToObtain: {},
      allowedToSpend: {},

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).to.be.deep.eq([]);
    expect(result.quotaDecrease).to.be.deep.eq([]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
  it("shouldn't change quota if it is disabled", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: {
        [tokenDataByNetwork.Mainnet.DAI]: {
          token: tokenDataByNetwork.Mainnet.DAI,
          isActive: false,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          token: tokenDataByNetwork.Mainnet.WETH,
          isActive: false,
        },
        [tokenDataByNetwork.Mainnet.STETH]: {
          token: tokenDataByNetwork.Mainnet.STETH,
          isActive: false,
        },
      },
      initialQuotas: caQuota,
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.DAI]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          amountInTarget: 0n * PERCENTAGE_FACTOR,
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

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).to.be.deep.eq([]);
    expect(result.quotaDecrease).to.be.deep.eq([]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
  it("swap shouldn't buy quota if no lt", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: {
        ...caQuota,
        [tokenDataByNetwork.Mainnet.STETH]: {
          quota: 5n * PERCENTAGE_FACTOR,
        },
      },
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.STETH]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          amountInTarget: 5n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
      },

      allowedToObtain: {
        [tokenDataByNetwork.Mainnet.STETH]: {},
      },
      allowedToSpend: { [tokenDataByNetwork.Mainnet.WETH]: {} },

      liquidationThresholds: {},
    });

    expect(result.quotaIncrease).to.be.deep.eq([]);
    expect(result.quotaDecrease).to.be.deep.eq([
      {
        balance: MIN_INT96,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
    ]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
  it("swap should buy quota with respect to lt", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: {
        ...caQuota,
        [tokenDataByNetwork.Mainnet.STETH]: { quota: 5n * PERCENTAGE_FACTOR },
      },
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.STETH]: {
          amountInTarget: 20n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          amountInTarget: 5n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
      },

      allowedToObtain: {
        [tokenDataByNetwork.Mainnet.STETH]: {},
      },
      allowedToSpend: { [tokenDataByNetwork.Mainnet.WETH]: {} },

      liquidationThresholds: {
        ...DEFAULT_LT,
        [tokenDataByNetwork.Mainnet.STETH]: 5000n,
      },
    });

    expect(result.quotaIncrease).to.be.deep.eq([
      {
        balance: 5n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    ]);
    expect(result.quotaDecrease).to.be.deep.eq([
      {
        balance: -5n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
    ]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
  it("swap shouldn't buy quota with respect to lt", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: {
        ...caQuota,
        [tokenDataByNetwork.Mainnet.STETH]: { quota: 5n * PERCENTAGE_FACTOR },
      },
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.STETH]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          amountInTarget: 5n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
      },

      allowedToObtain: {
        [tokenDataByNetwork.Mainnet.STETH]: {},
      },
      allowedToSpend: { [tokenDataByNetwork.Mainnet.WETH]: {} },

      liquidationThresholds: {
        ...DEFAULT_LT,
        [tokenDataByNetwork.Mainnet.STETH]: 5000n,
      },
    });

    expect(result.quotaIncrease).to.be.deep.eq([]);
    expect(result.quotaDecrease).to.be.deep.eq([
      {
        balance: -5n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
    ]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
  it("swap should buy additional quota after limit was increased", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      maxDebt: 10n * PERCENTAGE_FACTOR,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: {
        ...caQuota,
        [tokenDataByNetwork.Mainnet.DAI]: {
          quota: 10n * PERCENTAGE_FACTOR,
        },
      },
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.DAI]: {
          amountInTarget: 20n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          amountInTarget: 0n * PERCENTAGE_FACTOR,
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

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).to.be.deep.eq([
      {
        balance: 10n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
    ]);
    expect(result.quotaDecrease).to.be.deep.eq([
      {
        balance: MIN_INT96,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
    ]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 20n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
  it("swap should buy additional quota with respect to debt limit", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      maxDebt: 9n * PERCENTAGE_FACTOR,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: {
        ...caQuota,
        [tokenDataByNetwork.Mainnet.DAI]: {
          quota: 10n * PERCENTAGE_FACTOR,
        },
      },
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.DAI]: {
          amountInTarget: 20n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          amountInTarget: 0n * PERCENTAGE_FACTOR,
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

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).to.be.deep.eq([
      {
        balance: 8n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
    ]);
    expect(result.quotaDecrease).to.be.deep.eq([
      {
        balance: MIN_INT96,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
    ]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 18n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
  it("swap shouldn't buy additional quota if debt limit more then current quota", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      maxDebt: 5n * PERCENTAGE_FACTOR,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: {
        ...caQuota,
        [tokenDataByNetwork.Mainnet.DAI]: {
          quota: 10n * PERCENTAGE_FACTOR,
        },
      },
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.DAI]: {
          amountInTarget: 20n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          amountInTarget: 0n * PERCENTAGE_FACTOR,
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

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).to.be.deep.eq([]);
    expect(result.quotaDecrease).to.be.deep.eq([
      {
        balance: MIN_INT96,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
    ]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
  it("swap on old accounts should work correctly", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: {
        ...caQuota,
        [tokenDataByNetwork.Mainnet.DAI]: {
          quota: 5_2345n,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          quota: 10_7458n * PERCENTAGE_FACTOR,
        },
      },
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.STETH]: {
          amountInTarget: 10_1345n,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          amountInTarget: 0n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
      },

      allowedToObtain: {
        [tokenDataByNetwork.Mainnet.STETH]: {},
      },
      allowedToSpend: { [tokenDataByNetwork.Mainnet.WETH]: {} },

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).to.be.deep.eq([
      {
        balance: 10n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    ]);
    expect(result.quotaDecrease).to.be.deep.eq([
      {
        balance: MIN_INT96,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
    ]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 5_2345n,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
  it("swap on old accounts should work correctly and respect maxQuotaIncrease", () => {
    const result = CreditAccountData.calcQuotaUpdate({
      maxDebt: 6n * PERCENTAGE_FACTOR,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: {
        ...caQuota,
        [tokenDataByNetwork.Mainnet.DAI]: {
          quota: 5_2345n,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          quota: 10_7458n * PERCENTAGE_FACTOR,
        },
      },
      assetsAfterUpdate: {
        [tokenDataByNetwork.Mainnet.STETH]: {
          amountInTarget: 10_1345n,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          amountInTarget: 0n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: tokenDataByNetwork.Mainnet.DAI,
        },
      },

      allowedToObtain: {
        [tokenDataByNetwork.Mainnet.STETH]: {},
      },
      allowedToSpend: { [tokenDataByNetwork.Mainnet.WETH]: {} },

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).to.be.deep.eq([
      {
        balance: 7n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    ]);
    expect(result.quotaDecrease).to.be.deep.eq([
      {
        balance: MIN_INT96,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
    ]);
    expect(result.desiredQuota).to.be.deep.eq({
      [tokenDataByNetwork.Mainnet.DAI]: {
        balance: 5_2345n,
        token: tokenDataByNetwork.Mainnet.DAI,
      },
      [tokenDataByNetwork.Mainnet.WETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.WETH,
      },
      [tokenDataByNetwork.Mainnet.STETH]: {
        balance: 7n * PERCENTAGE_FACTOR,
        token: tokenDataByNetwork.Mainnet.STETH,
      },
    });
  });
});

describe("CreditAccount calcAvgQuotaBorrowRate test", () => {
  it("should calculate quota rate (same amounts, different rates)", () => {
    const result = CreditAccountData.calcQuotaBorrowRate({
      quotas: {
        [tokenDataByNetwork.Mainnet.DAI]: {
          token: tokenDataByNetwork.Mainnet.DAI,
          balance: 10n,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          token: tokenDataByNetwork.Mainnet.WETH,
          balance: 10n,
        },
        [tokenDataByNetwork.Mainnet.STETH]: {
          token: tokenDataByNetwork.Mainnet.STETH,
          balance: 10n,
        },
      },
      quotaRates: {
        [tokenDataByNetwork.Mainnet.DAI]: {
          rate: 5n,
          isActive: true,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          rate: 10n,
          isActive: true,
        },
        [tokenDataByNetwork.Mainnet.STETH]: {
          rate: 15n,
          isActive: true,
        },
      },
    });

    expect(result).to.be.eq(300n);
  });
  it("should calculate quota rate (same rates, different amounts)", () => {
    const result = CreditAccountData.calcQuotaBorrowRate({
      quotas: {
        [tokenDataByNetwork.Mainnet.DAI]: {
          token: tokenDataByNetwork.Mainnet.DAI,
          balance: 5n,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          token: tokenDataByNetwork.Mainnet.WETH,
          balance: 10n,
        },
        [tokenDataByNetwork.Mainnet.STETH]: {
          token: tokenDataByNetwork.Mainnet.STETH,
          balance: 15n,
        },
      },
      quotaRates: {
        [tokenDataByNetwork.Mainnet.DAI]: {
          rate: 10n,
          isActive: true,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          rate: 10n,
          isActive: true,
        },
        [tokenDataByNetwork.Mainnet.STETH]: {
          rate: 10n,
          isActive: true,
        },
      },
    });

    expect(result).to.be.eq(300n);
  });
  it("should calculate quota rate (disabled quota)", () => {
    const result = CreditAccountData.calcQuotaBorrowRate({
      quotas: {
        [tokenDataByNetwork.Mainnet.DAI]: {
          token: tokenDataByNetwork.Mainnet.DAI,
          balance: 5n,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          token: tokenDataByNetwork.Mainnet.WETH,
          balance: 10n,
        },
        [tokenDataByNetwork.Mainnet.STETH]: {
          token: tokenDataByNetwork.Mainnet.STETH,
          balance: 15n,
        },
      },
      quotaRates: {
        [tokenDataByNetwork.Mainnet.DAI]: {
          rate: 10n,
          isActive: true,
        },
        [tokenDataByNetwork.Mainnet.WETH]: {
          rate: 10n,
          isActive: false,
        },
        [tokenDataByNetwork.Mainnet.STETH]: {
          rate: 10n,
          isActive: true,
        },
      },
    });

    expect(result).to.be.eq(200n);
  });
});

describe("CreditAccount calcQuotaBorrowRate test", () => {
  it("should calculate quota borrow rate", () => {
    const result = CreditAccountData.calcQuotaBorrowRate({
      quotas: {
        [tokenDataByNetwork.Mainnet.DAI]: {
          token: tokenDataByNetwork.Mainnet.DAI,
          balance: 10n,
        },
      },
      quotaRates: {
        [tokenDataByNetwork.Mainnet.DAI]: {
          rate: 5n,
          isActive: true,
        },
      },
    });

    expect(result).to.be.eq(50n);
  });
  it("should calculate quota borrow rate when no balance", () => {
    const result = CreditAccountData.calcQuotaBorrowRate({
      quotas: {
        [tokenDataByNetwork.Mainnet.DAI]: {
          token: tokenDataByNetwork.Mainnet.DAI,
          balance: 1n,
        },
      },
      quotaRates: {
        [tokenDataByNetwork.Mainnet.DAI]: {
          rate: 5n,
          isActive: true,
        },
      },
    });

    expect(result).to.be.eq(5n);
  });
});

describe("CreditAccount calcRelativeBaseBorrowRate test", () => {
  it("should calculate relative borrow rate", () => {
    const result = CreditAccountData.calcRelativeBaseBorrowRate({
      debt: 200n,
      baseRateWithFee: 250,
      assetAmountInUnderlying: 200n,
    });

    expect(result).to.be.eq(10000000n);
  });
  it("should calculate relative borrow rate if position asset === 0", () => {
    const result = CreditAccountData.calcRelativeBaseBorrowRate({
      debt: 200n,
      baseRateWithFee: 250,
      assetAmountInUnderlying: 1n,
    });

    expect(result).to.be.eq(50000n);
  });
  it("should calculate relative borrow rate if position === 0", () => {
    const result = CreditAccountData.calcRelativeBaseBorrowRate({
      debt: 1n,
      baseRateWithFee: 250,
      assetAmountInUnderlying: 1n,
    });

    expect(result).to.be.eq(250n);
  });
});
