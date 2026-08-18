import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import { calcHealthFactor } from "../../../common-utils/utils/creditAccount/calc-health-factor.js";
import { liquidationPrice as legacyLiquidationPrice } from "../../../common-utils/utils/creditAccount/liquidation-price.js";
import { type Asset, PRICE_DECIMALS_POW, toBN, WAD } from "../../index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { borrowRate } from "./borrow-rate.js";
import { healthFactor } from "./health-factor.js";
import { positionMetrics } from "./index.js";
import { liquidationPrice } from "./liquidation-price.js";
import {
  timeToLiquidation,
  timeToLiquidationMs,
} from "./time-to-liquidation.js";
import type { AccountSnapshot } from "./types.js";

/**
 * Minimal sdk stub over plain records, covering exactly what the
 * position-metric functions read: decimals, convertToUSD, liquidation
 * thresholds, quota rates, the pool base rate and the interest fee.
 */
function stubSdk(args: {
  underlying: Address;
  decimals: Record<Address, number>;
  prices: Record<Address, bigint>;
  lts: Record<Address, number>;
  quotaRates?: Record<Address, { rate: number; isActive: boolean }>;
  baseInterestRate?: bigint;
  feeInterest?: number;
}): OnchainSDK {
  return {
    tokensMeta: {
      get: (token: Address) => {
        const d = args.decimals[token];
        return d === undefined ? undefined : { decimals: d };
      },
    },
    marketRegister: {
      findByCreditManager: () => ({
        pool: {
          underlying: args.underlying,
          pool: { baseInterestRate: args.baseInterestRate ?? 0n },
          pqk: {
            quotaRate: (token: Address) => args.quotaRates?.[token]?.rate ?? 0,
            hasActiveQuota: (token: Address) =>
              args.quotaRates?.[token]?.isActive ?? false,
          },
        },
        priceOracle: {
          convertToUSD: (token: Address, amount: bigint) => {
            const price = args.prices[token];
            if (price === undefined) {
              throw new Error(`no answer found for token ${token}`);
            }
            const decimals = args.decimals[token] ?? 18;
            return (amount * price) / 10n ** BigInt(decimals);
          },
        },
      }),
      findCreditManager: () => ({
        creditManager: {
          feeInterest: args.feeInterest ?? 0,
          liquidationThresholds: {
            get: (token: Address) => args.lts[token],
          },
        },
      }),
    },
  } as unknown as OnchainSDK;
}

// Token set and numbers of `credit-account.test.ts`, so the metrics computed
// through the new input can be pinned against the legacy results
const WETH =
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase() as Address;
const DAI =
  "0x6B175474E89094C44Da98b954EedeAC495271d0F".toLowerCase() as Address;
const USDC =
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48".toLowerCase() as Address;
const STETH =
  "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84".toLowerCase() as Address;

const decimals = { [WETH]: 18, [DAI]: 18, [USDC]: 6, [STETH]: 18 };
const prices = {
  [WETH]: toBN("1738.11830000", PRICE_DECIMALS_POW),
  [DAI]: toBN("0.99941103", PRICE_DECIMALS_POW),
  [USDC]: toBN("0.999", PRICE_DECIMALS_POW),
  [STETH]: toBN("1703.87588096", PRICE_DECIMALS_POW),
};
const lts = { [USDC]: 9800, [DAI]: 9300, [WETH]: 8500, [STETH]: 8000 };

const sdk = stubSdk({
  underlying: DAI,
  decimals,
  prices,
  lts,
  quotaRates: { [WETH]: { rate: 0, isActive: true } },
});

const DEFAULT_ASSETS: Asset[] = [
  { balance: toBN("156552", 18), token: DAI },
  { balance: toBN("10", 18), token: WETH },
];
const DEFAULT_DEBT = toBN("156552", 18);
const WETH_QUOTA: Asset = { balance: toBN(String(1750 * 10), 18), token: WETH };

function snapshot(partial: Partial<AccountSnapshot>): AccountSnapshot {
  return {
    creditManager: DAI, // stand-in: the stub resolves the market regardless
    assets: DEFAULT_ASSETS,
    quotas: [],
    debt: DEFAULT_DEBT,
    totalValue: DEFAULT_DEBT,
    ...partial,
  };
}

describe("healthFactor", () => {
  it("matches the legacy calcHealthFactor numbers", () => {
    expect(healthFactor(sdk, snapshot({}))).toBe(10244);
  });

  it("returns MAX_UINT16 when debt is zero", () => {
    expect(
      healthFactor(sdk, snapshot({ assets: [], debt: 0n, totalValue: 0n })),
    ).toBe(65535);
  });

  it("health factor after add collateral matches legacy", () => {
    const afterAdd: Asset[] = [
      { balance: toBN("156552", 18), token: DAI },
      { balance: toBN("20", 18), token: WETH },
    ];
    expect(healthFactor(sdk, snapshot({ assets: afterAdd }))).toBe(11188);
  });

  it("health factor after decrease debt matches legacy", () => {
    const afterDecrease: Asset[] = [
      { balance: toBN("146552", 18), token: DAI },
      { balance: toBN("10", 18), token: WETH },
    ];
    expect(
      healthFactor(
        sdk,
        snapshot({ assets: afterDecrease, debt: toBN("146552", 18) }),
      ),
    ).toBe(10308);
  });

  it("health factor after increase debt matches legacy", () => {
    const afterIncrease: Asset[] = [
      { balance: toBN("176552", 18), token: DAI },
      { balance: toBN("10", 18), token: WETH },
    ];
    expect(
      healthFactor(
        sdk,
        snapshot({ assets: afterIncrease, debt: toBN("176552", 18) }),
      ),
    ).toBe(10137);
  });

  it("health factor after swap matches legacy", () => {
    // the whole DAI balance swapped into WETH at oracle prices
    const totalMoney =
      (DEFAULT_DEBT * WAD * prices[DAI]) / 10n ** 18n / 10n ** 8n;
    const wethAmount =
      (totalMoney * 10n ** 18n * 10n ** 8n) / prices[WETH] / WAD;
    const afterSwap: Asset[] = [
      { balance: toBN("10", 18) + wethAmount, token: WETH },
    ];
    expect(healthFactor(sdk, snapshot({ assets: afterSwap }))).toBe(9444);
  });

  it("health factor with sufficient quota matches legacy", () => {
    expect(healthFactor(sdk, snapshot({ quotas: [WETH_QUOTA] }))).toBe(10244);
  });

  it("health factor with insufficient quota matches legacy", () => {
    expect(
      healthFactor(sdk, snapshot({ quotas: [{ token: WETH, balance: 0n }] })),
    ).toBe(9300);
  });

  it("health factor with disabled quota matches legacy", () => {
    const inactiveSdk = stubSdk({
      underlying: DAI,
      decimals,
      prices,
      lts,
      quotaRates: { [WETH]: { rate: 0, isActive: false } },
    });
    expect(healthFactor(inactiveSdk, snapshot({ quotas: [WETH_QUOTA] }))).toBe(
      9300,
    );
  });

  it("ignores leftover token balances at or below the dust threshold", () => {
    const withDust: Asset[] = [
      ...DEFAULT_ASSETS,
      { token: STETH, balance: 10n },
    ];
    expect(healthFactor(sdk, snapshot({ assets: withDust }))).toBe(
      healthFactor(sdk, snapshot({})),
    );
  });

  it("gives the same result through the deprecated wrapper", () => {
    const legacy = calcHealthFactor({
      quotas: { [WETH]: WETH_QUOTA },
      quotasInfo: { [WETH]: { isActive: true } },
      assets: DEFAULT_ASSETS,
      prices,
      liquidationThresholds: {
        [USDC]: 9800n,
        [DAI]: 9300n,
        [WETH]: 8500n,
        [STETH]: 8000n,
      },
      underlyingToken: DAI,
      debt: DEFAULT_DEBT,
      tokensList: {
        [WETH]: { symbol: "WETH", decimals: 18 },
        [DAI]: { symbol: "DAI", decimals: 18 },
        [USDC]: { symbol: "USDC", decimals: 6 },
        [STETH]: { symbol: "STETH", decimals: 18 },
      },
    });
    expect(healthFactor(sdk, snapshot({ quotas: [WETH_QUOTA] }))).toBe(legacy);
  });
});

describe("borrowRate", () => {
  // 2% base rate in ray, no interest fee: base = 200 Bps
  const baseInterestRate = 2n * 10n ** 25n;

  it("breaks the rate down into base and per-token quotas", () => {
    const brSdk = stubSdk({
      underlying: DAI,
      decimals,
      prices,
      lts,
      quotaRates: { [WETH]: { rate: 5, isActive: true } },
      baseInterestRate,
    });
    const result = borrowRate(
      brSdk,
      snapshot({
        debt: 5n,
        totalValue: 10n,
        quotas: [{ token: WETH, balance: 100n }],
      }),
    );

    expect(result.base).toBe(200);
    // quota: 100 * 5 = 500; total = 5*200/10 + 500/10; totalOnDebt = 200 + 500/5
    expect(result.quotas).toEqual({ [WETH]: 50 });
    expect(result.total).toBe(150);
    expect(result.totalOnDebt).toBe(300);
  });

  it("applies the interest fee to quota rates but not to the truncation parity base", () => {
    const brSdk = stubSdk({
      underlying: DAI,
      decimals,
      prices,
      lts,
      quotaRates: { [WETH]: { rate: 333, isActive: true } },
      baseInterestRate,
      feeInterest: 500,
    });
    const result = borrowRate(
      brSdk,
      snapshot({
        debt: 5n,
        totalValue: 10n,
        quotas: [{ token: WETH, balance: 100n }],
      }),
    );

    // base = 200 * 1.05 = 210
    expect(result.base).toBe(210);
    // rateBalance = 100 * 333 = 33300; with fee: 33300 * 1.05 = 34965
    expect(result.quotas).toEqual({ [WETH]: 3496 });
    // total = 5*210/10 + 34965/10; totalOnDebt = 210 + 34965/5
    expect(result.total).toBe(105 + 3496);
    expect(result.totalOnDebt).toBe(210 + 6993);
  });

  it("reports zero quota contribution for an inactive quota", () => {
    const brSdk = stubSdk({
      underlying: DAI,
      decimals,
      prices,
      lts,
      quotaRates: { [WETH]: { rate: 5, isActive: false } },
      baseInterestRate,
    });
    const result = borrowRate(
      brSdk,
      snapshot({
        debt: 5n,
        totalValue: 10n,
        quotas: [{ token: WETH, balance: 100n }],
      }),
    );

    expect(result.quotas).toEqual({ [WETH]: 0 });
    expect(result.total).toBe(100);
    expect(result.totalOnDebt).toBe(200);
  });

  it("skips leftover quotas at or below the dust threshold", () => {
    const brSdk = stubSdk({
      underlying: DAI,
      decimals,
      prices,
      lts,
      quotaRates: { [WETH]: { rate: 5, isActive: true } },
      baseInterestRate,
    });
    const result = borrowRate(
      brSdk,
      snapshot({
        debt: 5n,
        totalValue: 10n,
        quotas: [{ token: WETH, balance: 10n }],
      }),
    );

    expect(result.quotas).toEqual({});
    expect(result.total).toBe(100);
    expect(result.totalOnDebt).toBe(200);
  });

  it("reports zeros when there is nothing to normalize against", () => {
    const brSdk = stubSdk({
      underlying: DAI,
      decimals,
      prices,
      lts,
      quotaRates: { [WETH]: { rate: 5, isActive: true } },
      baseInterestRate,
    });
    const result = borrowRate(
      brSdk,
      snapshot({
        debt: 0n,
        totalValue: 0n,
        quotas: [{ token: WETH, balance: 100n }],
      }),
    );

    expect(result).toEqual({
      total: 0,
      totalOnDebt: 0,
      base: 200,
      quotas: { [WETH]: 0 },
    });
  });
});

describe("timeToLiquidation", () => {
  it("matches the legacy getTimeToLiquidation numbers", () => {
    expect(timeToLiquidationMs(9000, 250n)).toBe(null);
    expect(timeToLiquidationMs(9000, 0n)).toBe(null);
    expect(timeToLiquidationMs(13750, 20n * 10000n)).toBe(59130000n * 1000n);
  });

  it("composes health factor and borrow rate from the snapshot", () => {
    const ttlSdk = stubSdk({
      underlying: DAI,
      decimals,
      prices,
      lts,
      quotaRates: { [WETH]: { rate: 0, isActive: true } },
      baseInterestRate: 2n * 10n ** 25n,
    });
    const snap = snapshot({ quotas: [WETH_QUOTA] });
    const expected = timeToLiquidationMs(
      healthFactor(ttlSdk, snap),
      BigInt(borrowRate(ttlSdk, snap).totalOnDebt),
    );
    expect(timeToLiquidation(ttlSdk, snap)).toBe(expected);
    expect(expected).not.toBe(null);
  });

  it("returns null when the debt carries no rate", () => {
    expect(timeToLiquidation(sdk, snapshot({}))).toBe(null);
  });
});

describe("liquidationPrice", () => {
  const LP_ASSETS: Asset[] = [
    { token: USDC, balance: toBN("10000", 6) },
    { token: WETH, balance: toBN("25", 18) },
  ];
  const lpSdk = stubSdk({ underlying: USDC, decimals, prices, lts });
  const lpSnapshot = snapshot({
    assets: LP_ASSETS,
    debt: toBN("40000", 6),
    totalValue: toBN("40000", 6),
  });

  it("computes the price for a single non-underlying target", () => {
    // effectiveDebt = (40000e6 - 10000e6 * 0.98) * 1e12 = 30200e6 * 1e12
    // price = effectiveDebt * 1e8 * 10000 / (25e18 * 8500)
    const effectiveDebt = (toBN("40000", 6) - toBN("9800", 6)) * 10n ** 12n;
    const expected =
      (effectiveDebt * 10n ** 8n * 10000n) / (toBN("25", 18) * 8500n);
    expect(liquidationPrice(lpSdk, lpSnapshot)).toBe(expected);
    expect(expected).toBeGreaterThan(0n);
  });

  it("matches the deprecated wrapper with the same data", () => {
    const legacy = legacyLiquidationPrice({
      liquidationThresholds: {
        [USDC]: 9800n,
        [DAI]: 9300n,
        [WETH]: 8500n,
        [STETH]: 8000n,
      },
      debt: toBN("40000", 6),
      underlyingToken: USDC,
      targetToken: WETH,
      assets: {
        [USDC]: LP_ASSETS[0],
        [WETH]: LP_ASSETS[1],
      },
      tokensList: {
        [WETH]: { symbol: "WETH", decimals: 18 },
        [DAI]: { symbol: "DAI", decimals: 18 },
        [USDC]: { symbol: "USDC", decimals: 6 },
        [STETH]: { symbol: "STETH", decimals: 18 },
      },
    });
    expect(liquidationPrice(lpSdk, lpSnapshot)).toBe(legacy);
  });

  it("returns null with zero non-underlying assets", () => {
    expect(
      liquidationPrice(
        lpSdk,
        snapshot({ assets: [{ token: USDC, balance: toBN("10000", 6) }] }),
      ),
    ).toBe(null);
  });

  it("ignores leftover non-underlying when picking the target", () => {
    expect(
      liquidationPrice(
        lpSdk,
        snapshot({
          assets: [...LP_ASSETS, { token: STETH, balance: 10n }],
          debt: lpSnapshot.debt,
          totalValue: lpSnapshot.totalValue,
        }),
      ),
    ).toBe(liquidationPrice(lpSdk, lpSnapshot));
  });

  it("returns null with two non-underlying assets", () => {
    expect(
      liquidationPrice(
        lpSdk,
        snapshot({
          assets: [...LP_ASSETS, { token: STETH, balance: toBN("5", 18) }],
        }),
      ),
    ).toBe(null);
  });
});

describe("positionMetrics", () => {
  it("composes all metrics from the same snapshot", () => {
    const mSdk = stubSdk({
      underlying: USDC,
      decimals,
      prices,
      lts,
      quotaRates: { [WETH]: { rate: 5, isActive: true } },
      baseInterestRate: 2n * 10n ** 25n,
    });
    const snap: AccountSnapshot = {
      creditManager: USDC,
      assets: [
        { token: USDC, balance: toBN("10000", 6) },
        { token: WETH, balance: toBN("25", 18) },
      ],
      quotas: [{ token: WETH, balance: toBN("43000", 6) }],
      debt: toBN("40000", 6),
      totalValue: toBN("53000", 6),
    };

    const metrics = positionMetrics(mSdk, snap);

    // TODO: overall APY is stubbed until the collateral yield is wired up
    expect(metrics.overallApy).toBe(0);
    expect(metrics.healthFactor).toBe(healthFactor(mSdk, snap));
    expect(metrics.borrowRate).toEqual(borrowRate(mSdk, snap));
    expect(metrics.timeToLiquidation).toBe(timeToLiquidation(mSdk, snap));
    // exactly one non-underlying asset: a liquidation price exists
    expect(metrics.liquidationPrice).toBe(liquidationPrice(mSdk, snap));
    expect(metrics.liquidationPrice).not.toBe(null);
  });

  it("reports a null liquidation price for a two-target account", () => {
    const snap: AccountSnapshot = {
      creditManager: USDC,
      assets: [
        { token: WETH, balance: toBN("25", 18) },
        { token: STETH, balance: toBN("5", 18) },
      ],
      quotas: [],
      debt: toBN("40000", 6),
      totalValue: toBN("53000", 6),
    };
    expect(positionMetrics(sdk, snap).liquidationPrice).toBe(null);
  });
});
