import { describe, expect, it } from "@jest/globals";
import type { Address } from "viem";

import {
  MIN_INT96,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS_POW,
} from "../../constants";
import type { Asset } from "../../router";
import type { TokensAPYList } from "../apy";
import { TokenData } from "../tokens/tokenData";
import { toBN } from "../utils/formatter";
import { PriceUtils } from "../utils/price";
import { AssetUtils } from "./assets";
import type {
  CalcHealthFactorProps,
  CalcOverallAPYProps,
  CalcQuotaUpdateProps,
} from "./creditAccount";
import { CreditAccountData_Legacy } from "./creditAccount";

const WETH =
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase() as Address;
const DAI =
  "0x6B175474E89094C44Da98b954EedeAC495271d0F".toLowerCase() as Address;
const USDC =
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48".toLowerCase() as Address;
const STETH =
  "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84".toLowerCase() as Address;

const tokenDataList: Record<Address, TokenData> = {
  [WETH]: new TokenData({
    addr: WETH,
    decimals: 18,
    symbol: "WETH",
    name: "",
  }),
  [DAI]: new TokenData({
    addr: DAI,
    decimals: 18,
    symbol: "DAI",
    name: "",
  }),
  [USDC]: new TokenData({
    addr: USDC,
    decimals: 6,
    symbol: "USDC",
    name: "",
  }),
  [STETH]: new TokenData({
    addr: STETH,
    decimals: 18,
    symbol: "STETH",
    name: "",
  }),
};

interface CATestInfo {
  assets: Array<Asset>;
  totalValue: bigint;
  debt: bigint;
  borrowRate: number;
  underlyingToken: Address;
  quotas: Record<Address, Asset>;
  rates: CalcOverallAPYProps["quotaRates"];
}

const prices = {
  [WETH]: toBN("1738.11830000", PRICE_DECIMALS_POW),
  [DAI]: toBN("0.99941103", PRICE_DECIMALS_POW),
  [USDC]: toBN("0.999", PRICE_DECIMALS_POW),
  [STETH]: toBN("1703.87588096", PRICE_DECIMALS_POW),
};

const lpAPY: TokensAPYList = {
  [STETH]: 38434,
};

const DAI_DECIMALS = 18;
const WETH_DECIMALS = 18;
const STETH_DECIMALS = 18;
const USDC_DECIMALS = 6;

const caWithoutLP: CATestInfo = {
  assets: [
    {
      balance: toBN("54780", DAI_DECIMALS),
      token: DAI,
    },
    {
      balance: toBN("3.5", WETH_DECIMALS),
      token: WETH,
    },
  ],
  totalValue: toBN("60860", DAI_DECIMALS),
  debt: toBN("54780", DAI_DECIMALS),
  borrowRate: 7712,
  underlyingToken: DAI,
  quotas: {
    [WETH]: {
      balance: toBN("173811.830000", WETH_DECIMALS),
      token: DAI,
    },
  },
  rates: {
    [WETH]: {
      rate: 38434n,
      isActive: true,
    },
  },
};

const caWithLP: CATestInfo = {
  assets: [
    {
      balance: toBN("119.999999999999999997", STETH_DECIMALS),
      token: STETH,
    },
    {
      balance: toBN("3.5", WETH_DECIMALS),
      token: WETH,
    },
  ],
  totalValue: toBN("117.635897231615362429", WETH_DECIMALS),
  debt: toBN("90.000000000000000000", WETH_DECIMALS),
  borrowRate: 5736,
  underlyingToken: WETH,
  quotas: {
    [STETH]: {
      balance: toBN(
        String((1703.87588096 * 119.9999999999999) / 1738.1183),
        WETH_DECIMALS,
      ),
      token: STETH,
    },
  },
  rates: {
    [STETH]: {
      rate: 38434n,
      isActive: true,
    },
  },
};

describe("CreditAccount CreditAccountData_Legacy.calcOverallAPY test", () => {
  it("overall APY calculation for caWithoutLP is correct", () => {
    const result = CreditAccountData_Legacy.calcOverallAPY({
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
      tokensList: tokenDataList,
    });

    expect(result).toEqual(-69484n);
  });
  it("overall APY calculation for caWithLP is correct", () => {
    const result = CreditAccountData_Legacy.calcOverallAPY({
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
      tokensList: tokenDataList,
    });

    expect(result).toEqual(144919n);
  });
  it("overall APY is undefined when !lpAPY", () => {
    const result = CreditAccountData_Legacy.calcOverallAPY({
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
      tokensList: tokenDataList,
    });

    expect(result).toEqual(undefined);
  });
  it("overall APY is undefined when !totalValue", () => {
    const result = CreditAccountData_Legacy.calcOverallAPY({
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
      tokensList: tokenDataList,
    });

    expect(result).toEqual(undefined);
  });
  it("overall APY is undefined when !debt", () => {
    const result = CreditAccountData_Legacy.calcOverallAPY({
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
      tokensList: tokenDataList,
    });

    expect(result).toEqual(undefined);
  });
  it("overall APY is undefined when totalValue lte 0", () => {
    const result = CreditAccountData_Legacy.calcOverallAPY({
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
      tokensList: tokenDataList,
    });

    expect(result).toEqual(undefined);
  });
  it("overall APY calculation for caWithLP with sufficient quota is correct", () => {
    const result = CreditAccountData_Legacy.calcOverallAPY({
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
      tokensList: tokenDataList,
    });

    expect(result).toEqual(-18680n);
  });
  it("overall APY calculation for caWithLP with insufficient quota is correct", () => {
    const result = CreditAccountData_Legacy.calcOverallAPY({
      caAssets: caWithLP.assets,
      totalValue: caWithLP.totalValue,
      debt: caWithLP.debt,
      baseRateWithFee: caWithLP.borrowRate,
      underlyingToken: caWithLP.underlyingToken,

      quotaRates: caWithLP.rates,
      quotas: {
        [STETH]: {
          balance: 0n,
          token: STETH,
        },
      },
      feeInterest: 0,

      lpAPY,
      prices,
      tokensList: tokenDataList,
    });

    expect(result).toEqual(144919n);
  });
});

describe("CreditAccount calcMaxDebtIncrease test", () => {
  it("health max increase borrow is zero if hf < 1", () => {
    const result = CreditAccountData_Legacy.calcMaxDebtIncrease(
      9999,
      BigInt("156522834253690396032546"),
      9300,
    );
    expect(result.toString()).toEqual("0");
  });
  it("health max increase borrow is calculated correctly", () => {
    const result = CreditAccountData_Legacy.calcMaxDebtIncrease(
      10244,
      BigInt("156522834253690396032546"),
      9300,
    );

    expect(result.toString()).toEqual("54559387939857795188487");
  });
  it("health max increase borrow is calculated correctly (low hf, high debt)", () => {
    const loweHf = 10244;

    const result = CreditAccountData_Legacy.calcMaxDebtIncrease(
      loweHf,
      BigInt("54782991988791638611392"),
      9300,
    );

    expect(result.toString()).toEqual("19095785778950228315970");
  });
});

const liquidationThresholds = {
  [USDC]: 9800n,
  [DAI]: 9300n,
  [WETH]: 8500n,
  [STETH]: 8000n,
};

describe("CreditAccount calcMaxLendingDebt test", () => {
  it("calcMaxLendingDebt for several collaterals with zero lt", () => {
    const result = CreditAccountData_Legacy.calcMaxLendingDebt({
      assets: [
        {
          token: DAI,
          balance: toBN("1000", DAI_DECIMALS),
        },
        {
          token: WETH,
          balance: toBN("1", WETH_DECIMALS),
        },
      ],
      liquidationThresholds: {
        ...liquidationThresholds,
        [DAI]: 0n,
      },
      underlyingToken: USDC,
      prices: {
        [DAI]: 1n,
        [USDC]: 1n,
        [WETH]: 1000n,
      },
      tokensList: tokenDataList,
    });
    expect(result).toEqual(toBN("850", USDC_DECIMALS));
  });
  it("calcMaxLendingDebt for several collaterals with zero underlying price", () => {
    const result = CreditAccountData_Legacy.calcMaxLendingDebt({
      assets: [
        {
          token: DAI,
          balance: toBN("1000", DAI_DECIMALS),
        },
        {
          token: WETH,
          balance: toBN("1", WETH_DECIMALS),
        },
      ],
      liquidationThresholds: liquidationThresholds,
      underlyingToken: USDC,
      prices: {
        [DAI]: 1n,
        [WETH]: 1000n,
      },
      tokensList: tokenDataList,
    });
    expect(result).toEqual(0n);
  });
  it("calcMaxLendingDebt for simplest case", () => {
    const result = CreditAccountData_Legacy.calcMaxLendingDebt({
      assets: [
        {
          token: DAI,
          balance: toBN("1000", DAI_DECIMALS),
        },
      ],
      liquidationThresholds,
      underlyingToken: USDC,
      prices: {
        [DAI]: 1n,
        [USDC]: 1n,
      },
      tokensList: tokenDataList,
    });
    expect(result).toEqual(toBN("930", USDC_DECIMALS));
  });
  it("calcMaxLendingDebt for several collaterals", () => {
    const result = CreditAccountData_Legacy.calcMaxLendingDebt({
      assets: [
        {
          token: DAI,
          balance: toBN("1000", DAI_DECIMALS),
        },
        {
          token: WETH,
          balance: toBN("1", WETH_DECIMALS),
        },
      ],
      liquidationThresholds,
      underlyingToken: USDC,
      prices: {
        [DAI]: 1n,
        [USDC]: 1n,
        [WETH]: 1000n,
      },
      tokensList: tokenDataList,
    });
    expect(result).toEqual(toBN("1780", USDC_DECIMALS));
  });
  it("calcMaxLendingDebt for several collaterals with target HF", () => {
    const result = CreditAccountData_Legacy.calcMaxLendingDebt({
      assets: [
        {
          token: DAI,
          balance: toBN("1000", DAI_DECIMALS),
        },
        {
          token: WETH,
          balance: toBN("1", WETH_DECIMALS),
        },
      ],
      liquidationThresholds,
      underlyingToken: USDC,
      prices: {
        [DAI]: 1n,
        [USDC]: 1n,
        [WETH]: 1000n,
      },
      targetHF: 12500n,
      tokensList: tokenDataList,
    });
    expect(result).toEqual(toBN("1424", USDC_DECIMALS));
  });
});

interface CAHfTestInfo {
  assets: Array<Asset>;
  debt: bigint;
  underlyingToken: Address;
  healthFactor: number;
  underlyingDecimals: number;
  quotas: Record<Address, Asset>;
  quotasInfo: CalcHealthFactorProps["quotasInfo"];
}

const defaultCA: CAHfTestInfo = {
  assets: [
    {
      balance: toBN("156552", DAI_DECIMALS),
      token: DAI,
    },
    {
      balance: toBN("10", WETH_DECIMALS),
      token: WETH,
    },
  ],
  debt: toBN("156552", DAI_DECIMALS),
  healthFactor: 10244,
  underlyingToken: DAI,
  underlyingDecimals: DAI_DECIMALS,
  quotas: {
    [WETH]: {
      balance: toBN(String(1750 * 10), DAI_DECIMALS),
      token: WETH,
    },
  },
  quotasInfo: {
    [WETH]: {
      isActive: true,
    },
  },
};

describe("CreditAccount calcHealthFactor test", () => {
  it("health factor is calculated correctly", () => {
    const result = CreditAccountData_Legacy.calcHealthFactor({
      quotas: {},
      quotasInfo: {},
      assets: defaultCA.assets,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      debt: defaultCA.debt,
      tokensList: tokenDataList,
    });

    expect(result).toEqual(defaultCA.healthFactor);
  });
  it("health factor calculation has no division by zero error", () => {
    const result = CreditAccountData_Legacy.calcHealthFactor({
      quotas: {},
      quotasInfo: {},
      assets: [],
      prices: {},
      liquidationThresholds: {},
      underlyingToken: "" as Address,
      debt: 0n,
      tokensList: tokenDataList,
    });

    expect(result).toEqual(65535);
  });
  it("health factor after add collateral is calculated  correctly", () => {
    const collateral: Asset = {
      balance: toBN("10", WETH_DECIMALS),
      token: WETH,
    };

    const afterAdd = AssetUtils.sumAssets(defaultCA.assets, [collateral]);
    const result = CreditAccountData_Legacy.calcHealthFactor({
      quotas: {},
      quotasInfo: {},
      assets: afterAdd,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      debt: defaultCA.debt,
      tokensList: tokenDataList,
    });

    expect(result).toEqual(11188);
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
    const result = CreditAccountData_Legacy.calcHealthFactor({
      quotas: {},
      quotasInfo: {},
      assets: afterDecrease,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      debt: defaultCA.debt - amountDecrease,
      tokensList: tokenDataList,
    });

    expect(result).toEqual(10308);
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
    const result = CreditAccountData_Legacy.calcHealthFactor({
      quotas: {},
      quotasInfo: {},
      assets: afterIncrease,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      debt: defaultCA.debt + amountIncrease,
      tokensList: tokenDataList,
    });

    expect(result).toEqual(10137);
  });
  it("health factor after swap is calculated  correctly", () => {
    const swapAsset: Asset = {
      balance: defaultCA.debt,
      token: defaultCA.underlyingToken as Address,
    };
    const underlyingPrice = prices[defaultCA.underlyingToken];
    const wethPrice = prices[WETH];

    const getAmount = PriceUtils.convertByPrice(
      PriceUtils.calcTotalPrice(
        underlyingPrice,
        defaultCA.debt,
        defaultCA.underlyingDecimals,
      ),
      { price: wethPrice, decimals: WETH_DECIMALS },
    );

    const getAsset: Asset = {
      balance: getAmount,
      token: WETH,
    };

    const afterSub = AssetUtils.subAssets(defaultCA.assets, [swapAsset]);
    const afterSwap = AssetUtils.sumAssets(afterSub, [getAsset]);

    const result = CreditAccountData_Legacy.calcHealthFactor({
      quotas: {},
      quotasInfo: {},
      assets: afterSwap,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      debt: defaultCA.debt,
      tokensList: tokenDataList,
    });

    expect(result).toEqual(9444);
  });
  it("health factor with sufficient quotas is calculated correctly", () => {
    const result = CreditAccountData_Legacy.calcHealthFactor({
      quotas: defaultCA.quotas,
      quotasInfo: defaultCA.quotasInfo,
      assets: defaultCA.assets,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      debt: defaultCA.debt,
      tokensList: tokenDataList,
    });

    expect(result).toEqual(defaultCA.healthFactor);
  });
  it("health factor with insufficient quotas is calculated correctly", () => {
    const result = CreditAccountData_Legacy.calcHealthFactor({
      quotas: {
        [WETH]: {
          balance: 0n,
          token: WETH,
        },
      },
      quotasInfo: defaultCA.quotasInfo,
      assets: defaultCA.assets,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      debt: defaultCA.debt,
      tokensList: tokenDataList,
    });

    expect(result).toEqual(9300);
  });
  it("health factor with disabled quota is calculated correctly", () => {
    const result = CreditAccountData_Legacy.calcHealthFactor({
      quotas: defaultCA.quotas,
      quotasInfo: {
        [WETH]: {
          isActive: false,
        },
      },
      assets: defaultCA.assets,
      prices,
      liquidationThresholds,
      underlyingToken: defaultCA.underlyingToken,
      debt: defaultCA.debt,
      tokensList: tokenDataList,
    });

    expect(result).toEqual(9300);
  });
});

const cmQuotas: CalcQuotaUpdateProps["quotas"] = {
  [DAI]: {
    token: DAI,
    isActive: true,
  },
  [WETH]: {
    token: WETH,
    isActive: true,
  },
  [STETH]: {
    token: STETH,
    isActive: true,
  },
};

const caQuota: CalcQuotaUpdateProps["initialQuotas"] = {
  [DAI]: {
    quota: 5n * PERCENTAGE_FACTOR,
  },
  [WETH]: {
    quota: 10n * PERCENTAGE_FACTOR,
  },
};

const QUOTA_RESERVE = 100n;
const DEFAULT_LT = {
  [DAI]: PERCENTAGE_FACTOR,
  [WETH]: PERCENTAGE_FACTOR,
  [STETH]: PERCENTAGE_FACTOR,
};
const HUGE_MAX_DEBT = 20n * PERCENTAGE_FACTOR;

describe("CreditAccount calcQuotaUpdate test", () => {
  it("open account should buy quota", () => {
    const result = CreditAccountData_Legacy.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: {},
      assetsAfterUpdate: {
        [DAI]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: DAI,
        },
        [WETH]: {
          amountInTarget: 20n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: WETH,
        },
      },

      allowedToObtain: {
        [DAI]: {},
        [WETH]: {},
      },
      allowedToSpend: {},

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).toEqual([
      {
        balance: 10n * PERCENTAGE_FACTOR,
        token: DAI,
      },
      {
        balance: 20n * PERCENTAGE_FACTOR,
        token: WETH,
      },
    ]);
    expect(result.quotaDecrease).toEqual([]);
    expect(result.desiredQuota).toEqual({
      [DAI]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: DAI,
      },
      [WETH]: {
        balance: 20n * PERCENTAGE_FACTOR,
        token: WETH,
      },
      [STETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: STETH,
      },
    });
  });
  it("add collateral should buy quota", () => {
    const result = CreditAccountData_Legacy.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: caQuota,
      assetsAfterUpdate: {
        [STETH]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: DAI,
        },
      },

      allowedToObtain: {
        [STETH]: {},
      },
      allowedToSpend: {},

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).toEqual([
      {
        balance: 10n * PERCENTAGE_FACTOR,
        token: STETH,
      },
    ]);
    expect(result.quotaDecrease).toEqual([]);
    expect(result.desiredQuota).toEqual({
      [DAI]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: DAI,
      },
      [WETH]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: WETH,
      },
      [STETH]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: STETH,
      },
    });
  });
  it("add collateral should add additional quota", () => {
    const result = CreditAccountData_Legacy.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: caQuota,
      assetsAfterUpdate: {
        [DAI]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: DAI,
        },
      },

      allowedToObtain: {
        [DAI]: {},
      },
      allowedToSpend: {},

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).toEqual([
      {
        balance: 5n * PERCENTAGE_FACTOR,
        token: DAI,
      },
    ]);
    expect(result.quotaDecrease).toEqual([]);
    expect(result.desiredQuota).toEqual({
      [DAI]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: DAI,
      },
      [WETH]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: WETH,
      },
      [STETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: STETH,
      },
    });
  });
  it("add collateral shouldn't add additional quota", () => {
    const result = CreditAccountData_Legacy.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: caQuota,
      assetsAfterUpdate: {
        [WETH]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: WETH,
        },
      },

      allowedToObtain: {
        [WETH]: {},
      },
      allowedToSpend: {},

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).toEqual([]);
    expect(result.quotaDecrease).toEqual([]);
    expect(result.desiredQuota).toEqual({
      [DAI]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: DAI,
      },
      [WETH]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: WETH,
      },
      [STETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: STETH,
      },
    });
  });
  it("swap should buy quota", () => {
    const result = CreditAccountData_Legacy.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: caQuota,
      assetsAfterUpdate: {
        [STETH]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: DAI,
        },
        [WETH]: {
          amountInTarget: 0n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: DAI,
        },
      },

      allowedToObtain: {
        [STETH]: {},
      },
      allowedToSpend: { [WETH]: {} },

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).toEqual([
      {
        balance: 10n * PERCENTAGE_FACTOR,
        token: STETH,
      },
    ]);
    expect(result.quotaDecrease).toEqual([
      {
        balance: MIN_INT96,
        token: WETH,
      },
    ]);
    expect(result.desiredQuota).toEqual({
      [DAI]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: DAI,
      },
      [WETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: WETH,
      },
      [STETH]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: STETH,
      },
    });
  });
  it("swap should buy additional quota", () => {
    const result = CreditAccountData_Legacy.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: caQuota,
      assetsAfterUpdate: {
        [DAI]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: DAI,
        },
        [WETH]: {
          amountInTarget: 0n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: WETH,
        },
      },

      allowedToObtain: {
        [DAI]: {},
      },
      allowedToSpend: {
        [WETH]: {},
      },

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).toEqual([
      {
        balance: 5n * PERCENTAGE_FACTOR,
        token: DAI,
      },
    ]);
    expect(result.quotaDecrease).toEqual([
      {
        balance: MIN_INT96,
        token: WETH,
      },
    ]);
    expect(result.desiredQuota).toEqual({
      [DAI]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: DAI,
      },
      [WETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: WETH,
      },
      [STETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: STETH,
      },
    });
  });
  it("swap should buy additional quota with respect to debt", () => {
    const result = CreditAccountData_Legacy.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: caQuota,
      calcModification: {
        debt: 7n * PERCENTAGE_FACTOR,
        type: "recommendedQuota",
      },
      assetsAfterUpdate: {
        [DAI]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: DAI,
        },
        [WETH]: {
          amountInTarget: 0n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: WETH,
        },
      },

      allowedToObtain: {
        [DAI]: {},
      },
      allowedToSpend: {
        [WETH]: {},
      },

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).toEqual([
      {
        balance: 2n * PERCENTAGE_FACTOR,
        token: DAI,
      },
    ]);
    expect(result.quotaDecrease).toEqual([
      {
        balance: MIN_INT96,
        token: WETH,
      },
    ]);
    expect(result.desiredQuota).toEqual({
      [DAI]: {
        balance: 7n * PERCENTAGE_FACTOR,
        token: DAI,
      },
      [WETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: WETH,
      },
      [STETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: STETH,
      },
    });
  });
  it("swap shouldn't buy additional quota", () => {
    const result = CreditAccountData_Legacy.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: caQuota,
      assetsAfterUpdate: {
        [WETH]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: WETH,
        },
        [DAI]: {
          amountInTarget: 0n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: DAI,
        },
      },

      allowedToObtain: {
        [WETH]: {},
      },
      allowedToSpend: { [DAI]: {} },

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).toEqual([]);
    expect(result.quotaDecrease).toEqual([
      {
        balance: MIN_INT96,
        token: DAI,
      },
    ]);
    expect(result.desiredQuota).toEqual({
      [DAI]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: DAI,
      },
      [WETH]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: WETH,
      },
      [STETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: STETH,
      },
    });
  });
  it("shouldn't change quota if disallowed", () => {
    const result = CreditAccountData_Legacy.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: caQuota,
      assetsAfterUpdate: {
        [DAI]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: DAI,
        },
        [WETH]: {
          amountInTarget: 0n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: WETH,
        },
      },

      allowedToObtain: {},
      allowedToSpend: {},

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).toEqual([]);
    expect(result.quotaDecrease).toEqual([]);
    expect(result.desiredQuota).toEqual({
      [DAI]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: DAI,
      },
      [WETH]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: WETH,
      },
      [STETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: STETH,
      },
    });
  });
  it("shouldn't change quota if it is disabled", () => {
    const result = CreditAccountData_Legacy.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: {
        [DAI]: {
          token: DAI,
          isActive: false,
        },
        [WETH]: {
          token: WETH,
          isActive: false,
        },
        [STETH]: {
          token: STETH,
          isActive: false,
        },
      },
      initialQuotas: caQuota,
      assetsAfterUpdate: {
        [DAI]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: DAI,
        },
        [WETH]: {
          amountInTarget: 0n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: WETH,
        },
      },

      allowedToObtain: {
        [DAI]: {},
      },
      allowedToSpend: {
        [WETH]: {},
      },

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).toEqual([]);
    expect(result.quotaDecrease).toEqual([]);
    expect(result.desiredQuota).toEqual({
      [DAI]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: DAI,
      },
      [WETH]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: WETH,
      },
      [STETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: STETH,
      },
    });
  });
  it("swap shouldn't buy quota if no lt", () => {
    const result = CreditAccountData_Legacy.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: {
        ...caQuota,
        [STETH]: {
          quota: 5n * PERCENTAGE_FACTOR,
        },
      },
      assetsAfterUpdate: {
        [STETH]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: DAI,
        },
        [WETH]: {
          amountInTarget: 5n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: DAI,
        },
      },

      allowedToObtain: {
        [STETH]: {},
      },
      allowedToSpend: { [WETH]: {} },

      liquidationThresholds: {},
    });

    expect(result.quotaIncrease).toEqual([]);
    expect(result.quotaDecrease).toEqual([
      {
        balance: MIN_INT96,
        token: WETH,
      },
    ]);
    expect(result.desiredQuota).toEqual({
      [DAI]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: DAI,
      },
      [WETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: WETH,
      },
      [STETH]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: STETH,
      },
    });
  });
  it("swap should buy quota with respect to lt", () => {
    const result = CreditAccountData_Legacy.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: {
        ...caQuota,
        [STETH]: { quota: 5n * PERCENTAGE_FACTOR },
      },
      assetsAfterUpdate: {
        [STETH]: {
          amountInTarget: 20n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: DAI,
        },
        [WETH]: {
          amountInTarget: 5n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: DAI,
        },
      },

      allowedToObtain: {
        [STETH]: {},
      },
      allowedToSpend: { [WETH]: {} },

      liquidationThresholds: {
        ...DEFAULT_LT,
        [STETH]: 5000n,
      },
    });

    expect(result.quotaIncrease).toEqual([
      {
        balance: 5n * PERCENTAGE_FACTOR,
        token: STETH,
      },
    ]);
    expect(result.quotaDecrease).toEqual([
      {
        balance: -5n * PERCENTAGE_FACTOR,
        token: WETH,
      },
    ]);
    expect(result.desiredQuota).toEqual({
      [DAI]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: DAI,
      },
      [WETH]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: WETH,
      },
      [STETH]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: STETH,
      },
    });
  });
  it("swap shouldn't buy quota with respect to lt", () => {
    const result = CreditAccountData_Legacy.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: {
        ...caQuota,
        [STETH]: { quota: 5n * PERCENTAGE_FACTOR },
      },
      assetsAfterUpdate: {
        [STETH]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: DAI,
        },
        [WETH]: {
          amountInTarget: 5n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: DAI,
        },
      },

      allowedToObtain: {
        [STETH]: {},
      },
      allowedToSpend: { [WETH]: {} },

      liquidationThresholds: {
        ...DEFAULT_LT,
        [STETH]: 5000n,
      },
    });

    expect(result.quotaIncrease).toEqual([]);
    expect(result.quotaDecrease).toEqual([
      {
        balance: -5n * PERCENTAGE_FACTOR,
        token: WETH,
      },
    ]);
    expect(result.desiredQuota).toEqual({
      [DAI]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: DAI,
      },
      [WETH]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: WETH,
      },
      [STETH]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: STETH,
      },
    });
  });
  it("swap should buy additional quota after limit was increased", () => {
    const result = CreditAccountData_Legacy.calcQuotaUpdate({
      maxDebt: 10n * PERCENTAGE_FACTOR,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: {
        ...caQuota,
        [DAI]: {
          quota: 10n * PERCENTAGE_FACTOR,
        },
      },
      assetsAfterUpdate: {
        [DAI]: {
          amountInTarget: 20n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: DAI,
        },
        [WETH]: {
          amountInTarget: 0n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: WETH,
        },
      },

      allowedToObtain: {
        [DAI]: {},
      },
      allowedToSpend: {
        [WETH]: {},
      },

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).toEqual([
      {
        balance: 10n * PERCENTAGE_FACTOR,
        token: DAI,
      },
    ]);
    expect(result.quotaDecrease).toEqual([
      {
        balance: MIN_INT96,
        token: WETH,
      },
    ]);
    expect(result.desiredQuota).toEqual({
      [DAI]: {
        balance: 20n * PERCENTAGE_FACTOR,
        token: DAI,
      },
      [WETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: WETH,
      },
      [STETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: STETH,
      },
    });
  });
  it("swap should buy additional quota with respect to debt limit", () => {
    const result = CreditAccountData_Legacy.calcQuotaUpdate({
      maxDebt: 9n * PERCENTAGE_FACTOR,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: {
        ...caQuota,
        [DAI]: {
          quota: 10n * PERCENTAGE_FACTOR,
        },
      },
      assetsAfterUpdate: {
        [DAI]: {
          amountInTarget: 20n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: DAI,
        },
        [WETH]: {
          amountInTarget: 0n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: WETH,
        },
      },

      allowedToObtain: {
        [DAI]: {},
      },
      allowedToSpend: {
        [WETH]: {},
      },

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).toEqual([
      {
        balance: 8n * PERCENTAGE_FACTOR,
        token: DAI,
      },
    ]);
    expect(result.quotaDecrease).toEqual([
      {
        balance: MIN_INT96,
        token: WETH,
      },
    ]);
    expect(result.desiredQuota).toEqual({
      [DAI]: {
        balance: 18n * PERCENTAGE_FACTOR,
        token: DAI,
      },
      [WETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: WETH,
      },
      [STETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: STETH,
      },
    });
  });
  it("swap shouldn't buy additional quota if debt limit more then current quota", () => {
    const result = CreditAccountData_Legacy.calcQuotaUpdate({
      maxDebt: 5n * PERCENTAGE_FACTOR,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: {
        ...caQuota,
        [DAI]: {
          quota: 10n * PERCENTAGE_FACTOR,
        },
      },
      assetsAfterUpdate: {
        [DAI]: {
          amountInTarget: 20n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: DAI,
        },
        [WETH]: {
          amountInTarget: 0n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: WETH,
        },
      },

      allowedToObtain: {
        [DAI]: {},
      },
      allowedToSpend: {
        [WETH]: {},
      },

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).toEqual([]);
    expect(result.quotaDecrease).toEqual([
      {
        balance: MIN_INT96,
        token: WETH,
      },
    ]);
    expect(result.desiredQuota).toEqual({
      [DAI]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: DAI,
      },
      [WETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: WETH,
      },
      [STETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: STETH,
      },
    });
  });
  it("swap on old accounts should work correctly", () => {
    const result = CreditAccountData_Legacy.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: {
        ...caQuota,
        [DAI]: {
          quota: 5_2345n,
        },
        [WETH]: {
          quota: 10_7458n * PERCENTAGE_FACTOR,
        },
      },
      assetsAfterUpdate: {
        [STETH]: {
          amountInTarget: 10_1345n,
          balance: 0n,
          token: STETH,
        },
        [WETH]: {
          amountInTarget: 0n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: WETH,
        },
      },

      allowedToObtain: {
        [STETH]: {},
      },
      allowedToSpend: { [WETH]: {} },

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).toEqual([
      {
        balance: 10n * PERCENTAGE_FACTOR,
        token: STETH,
      },
    ]);
    expect(result.quotaDecrease).toEqual([
      {
        balance: MIN_INT96,
        token: WETH,
      },
    ]);
    expect(result.desiredQuota).toEqual({
      [DAI]: {
        balance: 5_2345n,
        token: DAI,
      },
      [WETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: WETH,
      },
      [STETH]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: STETH,
      },
    });
  });
  it("swap on old accounts should work correctly and respect maxQuotaIncrease", () => {
    const result = CreditAccountData_Legacy.calcQuotaUpdate({
      maxDebt: 6n * PERCENTAGE_FACTOR,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: {
        ...caQuota,
        [DAI]: {
          quota: 5_2345n,
        },
        [WETH]: {
          quota: 10_7458n * PERCENTAGE_FACTOR,
        },
      },
      assetsAfterUpdate: {
        [STETH]: {
          amountInTarget: 10_1345n,
          balance: 0n,
          token: STETH,
        },
        [WETH]: {
          amountInTarget: 0n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: WETH,
        },
      },

      allowedToObtain: {
        [STETH]: {},
      },
      allowedToSpend: { [WETH]: {} },

      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).toEqual([
      {
        balance: 7n * PERCENTAGE_FACTOR,
        token: STETH,
      },
    ]);
    expect(result.quotaDecrease).toEqual([
      {
        balance: MIN_INT96,
        token: WETH,
      },
    ]);
    expect(result.desiredQuota).toEqual({
      [DAI]: {
        balance: 5_2345n,
        token: DAI,
      },
      [WETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: WETH,
      },
      [STETH]: {
        balance: 7n * PERCENTAGE_FACTOR,
        token: STETH,
      },
    });
  });
  it("should buy quota correctly when all assets listed in both buy and spend", () => {
    const result = CreditAccountData_Legacy.calcQuotaUpdate({
      maxDebt: HUGE_MAX_DEBT,
      quotaReserve: QUOTA_RESERVE,
      quotas: cmQuotas,
      initialQuotas: {
        ...caQuota,
        [DAI]: {
          quota: 0n * PERCENTAGE_FACTOR,
        },
        [STETH]: {
          quota: 15n * PERCENTAGE_FACTOR,
        },
      },
      assetsAfterUpdate: {
        [STETH]: {
          amountInTarget: 0n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: STETH,
        },
        [DAI]: {
          amountInTarget: 10n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: DAI,
        },
        [WETH]: {
          amountInTarget: 5n * PERCENTAGE_FACTOR,
          balance: 0n,
          token: WETH,
        },
      },

      allowedToObtain: {
        [STETH]: {},
        [DAI]: {},
        [WETH]: {},
      },
      allowedToSpend: {
        [STETH]: {},
        [DAI]: {},
        [WETH]: {},
      },
      liquidationThresholds: DEFAULT_LT,
    });

    expect(result.quotaIncrease).toEqual([
      {
        balance: 10n * PERCENTAGE_FACTOR,
        token: DAI,
      },
    ]);
    expect(result.quotaDecrease).toEqual([
      {
        balance: MIN_INT96,
        token: STETH,
      },
      {
        balance: -5n * PERCENTAGE_FACTOR,
        token: WETH,
      },
    ]);
    expect(result.desiredQuota).toEqual({
      [DAI]: {
        balance: 10n * PERCENTAGE_FACTOR,
        token: DAI,
      },
      [WETH]: {
        balance: 5n * PERCENTAGE_FACTOR,
        token: WETH,
      },
      [STETH]: {
        balance: 0n * PERCENTAGE_FACTOR,
        token: STETH,
      },
    });
  });
});

describe("CreditAccount calcAvgQuotaBorrowRate test", () => {
  it("should calculate quota rate (same amounts, different rates)", () => {
    const result = CreditAccountData_Legacy.calcQuotaBorrowRate({
      quotas: {
        [DAI]: {
          token: DAI,
          balance: 10n,
        },
        [WETH]: {
          token: WETH,
          balance: 10n,
        },
        [STETH]: {
          token: STETH,
          balance: 10n,
        },
      },
      quotaRates: {
        [DAI]: {
          rate: 5n,
          isActive: true,
        },
        [WETH]: {
          rate: 10n,
          isActive: true,
        },
        [STETH]: {
          rate: 15n,
          isActive: true,
        },
      },
    });

    expect(result).toEqual(300n);
  });
  it("should calculate quota rate (same rates, different amounts)", () => {
    const result = CreditAccountData_Legacy.calcQuotaBorrowRate({
      quotas: {
        [DAI]: {
          token: DAI,
          balance: 5n,
        },
        [WETH]: {
          token: WETH,
          balance: 10n,
        },
        [STETH]: {
          token: STETH,
          balance: 15n,
        },
      },
      quotaRates: {
        [DAI]: {
          rate: 10n,
          isActive: true,
        },
        [WETH]: {
          rate: 10n,
          isActive: true,
        },
        [STETH]: {
          rate: 10n,
          isActive: true,
        },
      },
    });

    expect(result).toEqual(300n);
  });
  it("should calculate quota rate (disabled quota)", () => {
    const result = CreditAccountData_Legacy.calcQuotaBorrowRate({
      quotas: {
        [DAI]: {
          token: DAI,
          balance: 5n,
        },
        [WETH]: {
          token: WETH,
          balance: 10n,
        },
        [STETH]: {
          token: STETH,
          balance: 15n,
        },
      },
      quotaRates: {
        [DAI]: {
          rate: 10n,
          isActive: true,
        },
        [WETH]: {
          rate: 10n,
          isActive: false,
        },
        [STETH]: {
          rate: 10n,
          isActive: true,
        },
      },
    });

    expect(result).toEqual(200n);
  });
});

describe("CreditAccount calcQuotaBorrowRate test", () => {
  it("should calculate quota borrow rate", () => {
    const result = CreditAccountData_Legacy.calcQuotaBorrowRate({
      quotas: {
        [DAI]: {
          token: DAI,
          balance: 10n,
        },
      },
      quotaRates: {
        [DAI]: {
          rate: 5n,
          isActive: true,
        },
      },
    });

    expect(result).toEqual(50n);
  });
  it("should calculate quota borrow rate when no balance", () => {
    const result = CreditAccountData_Legacy.calcQuotaBorrowRate({
      quotas: {
        [DAI]: {
          token: DAI,
          balance: 1n,
        },
      },
      quotaRates: {
        [DAI]: {
          rate: 5n,
          isActive: true,
        },
      },
    });

    expect(result).toEqual(5n);
  });
});

describe("CreditAccount calcRelativeBaseBorrowRate test", () => {
  it("should calculate relative borrow rate", () => {
    const result = CreditAccountData_Legacy.calcRelativeBaseBorrowRate({
      debt: 200n,
      baseRateWithFee: 250,
      assetAmountInUnderlying: 200n,
    });

    expect(result).toEqual(10000000n);
  });
  it("should calculate relative borrow rate if position asset === 0", () => {
    const result = CreditAccountData_Legacy.calcRelativeBaseBorrowRate({
      debt: 200n,
      baseRateWithFee: 250,
      assetAmountInUnderlying: 1n,
    });

    expect(result).toEqual(50000n);
  });
  it("should calculate relative borrow rate if position === 0", () => {
    const result = CreditAccountData_Legacy.calcRelativeBaseBorrowRate({
      debt: 1n,
      baseRateWithFee: 250,
      assetAmountInUnderlying: 1n,
    });

    expect(result).toEqual(250n);
  });
});

describe("CreditAccount getTimeToLiquidation test", () => {
  it("should return 0 when HF < 1", () => {
    const result = CreditAccountData_Legacy.getTimeToLiquidation({
      healthFactor: 9000,
      totalBorrowRate_debt: 250n,
    });

    expect(result).toEqual(null);
  });
  it("should return 0 when br_debt === 0", () => {
    const result = CreditAccountData_Legacy.getTimeToLiquidation({
      healthFactor: 9000,
      totalBorrowRate_debt: 0n,
    });

    expect(result).toEqual(null);
  });
  it("should calculate time to liquidation correctly", () => {
    const result = CreditAccountData_Legacy.getTimeToLiquidation({
      healthFactor: 13750,
      totalBorrowRate_debt: 20n * 10000n,
    });

    // 59_130_000
    expect(result).toEqual(59130000n * 1000n);
  });
});
