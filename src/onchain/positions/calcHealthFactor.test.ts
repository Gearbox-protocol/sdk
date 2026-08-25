import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import { type Asset, PRICE_DECIMALS_POW, toBN, WAD } from "../index.js";
import { calcHealthFactor } from "./calcHealthFactor.js";
import type { AccountSnapshot } from "./types.js";

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
const liquidationThresholds = {
  [USDC]: 9800,
  [DAI]: 9300,
  [WETH]: 8500,
  [STETH]: 8000,
};

const DEFAULT_ASSETS: Asset[] = [
  { balance: toBN("156552", 18), token: DAI },
  { balance: toBN("10", 18), token: WETH },
];
const DEFAULT_DEBT = toBN("156552", 18);
const WETH_QUOTA: Asset = { balance: toBN(String(1750 * 10), 18), token: WETH };

function snapshot(partial: Partial<AccountSnapshot> = {}): AccountSnapshot {
  return {
    creditManager: DAI,
    assets: DEFAULT_ASSETS,
    quotas: [],
    totalDebt: DEFAULT_DEBT,
    totalValue: DEFAULT_DEBT,
    ...partial,
  };
}

function hf(
  snap: Partial<AccountSnapshot> = {},
  extras: {
    activeQuotas?: Record<Address, boolean>;
    prices?: Record<Address, bigint>;
  } = {},
) {
  return calcHealthFactor({
    snapshot: snapshot(snap),
    underlying: DAI,
    decimals,
    prices: extras.prices ?? prices,
    liquidationThresholds,
    activeQuotas: extras.activeQuotas ?? { [WETH]: true },
  });
}

describe("calcHealthFactor", () => {
  it("matches the legacy calcHealthFactor numbers", () => {
    expect(hf()).toBe(10244);
  });

  it("returns MAX_UINT16 when debt is zero", () => {
    expect(hf({ assets: [], totalDebt: 0n, totalValue: 0n })).toBe(65535);
  });

  it("health factor after add collateral matches legacy", () => {
    const afterAdd: Asset[] = [
      { balance: toBN("156552", 18), token: DAI },
      { balance: toBN("20", 18), token: WETH },
    ];
    expect(hf({ assets: afterAdd })).toBe(11188);
  });

  it("health factor after decrease debt matches legacy", () => {
    const afterDecrease: Asset[] = [
      { balance: toBN("146552", 18), token: DAI },
      { balance: toBN("10", 18), token: WETH },
    ];
    expect(hf({ assets: afterDecrease, totalDebt: toBN("146552", 18) })).toBe(
      10308,
    );
  });

  it("health factor after increase debt matches legacy", () => {
    const afterIncrease: Asset[] = [
      { balance: toBN("176552", 18), token: DAI },
      { balance: toBN("10", 18), token: WETH },
    ];
    expect(hf({ assets: afterIncrease, totalDebt: toBN("176552", 18) })).toBe(
      10137,
    );
  });

  it("health factor after swap matches legacy", () => {
    const totalMoney =
      (DEFAULT_DEBT * WAD * prices[DAI]) / 10n ** 18n / 10n ** 8n;
    const wethAmount =
      (totalMoney * 10n ** 18n * 10n ** 8n) / prices[WETH] / WAD;
    const afterSwap: Asset[] = [
      { balance: toBN("10", 18) + wethAmount, token: WETH },
    ];
    expect(hf({ assets: afterSwap })).toBe(9444);
  });

  it("health factor with sufficient quota matches legacy", () => {
    expect(hf({ quotas: [WETH_QUOTA] })).toBe(10244);
  });

  it("health factor with insufficient quota matches legacy", () => {
    expect(hf({ quotas: [{ token: WETH, balance: 0n }] })).toBe(9300);
  });

  it("health factor with disabled quota matches legacy", () => {
    expect(hf({ quotas: [WETH_QUOTA] }, { activeQuotas: {} })).toBe(9300);
  });

  it("ignores leftover token balances at or below the dust threshold", () => {
    const withDust: Asset[] = [
      ...DEFAULT_ASSETS,
      { token: STETH, balance: 10n },
    ];
    expect(hf({ assets: withDust })).toBe(hf());
  });

  it("values the debt when the underlying is priced but not held", () => {
    const withoutUnderlying: Asset[] = [
      { balance: toBN("10", 18), token: WETH },
    ];
    expect(hf({ assets: withoutUnderlying })).toBeGreaterThan(0);
    expect(hf({ assets: withoutUnderlying })).toBe(
      hf({
        assets: [
          { balance: 0n, token: DAI },
          { balance: toBN("10", 18), token: WETH },
        ],
      }),
    );
  });

  it("collapses to zero when the underlying has no price", () => {
    const { [DAI]: _dai, ...pricesWithoutUnderlying } = prices;
    expect(hf({}, { prices: pricesWithoutUnderlying })).toBe(0);
  });
});
