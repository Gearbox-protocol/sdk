import { describe, expect, it, vi } from "vitest";
import type { StrategyPosition } from "../../../../model/index.js";
import { LEVERAGE_DECIMALS } from "../../../constants/math.js";
import type { OnchainSDK } from "../../../index.js";
import { toBN } from "../../../utils/index.js";
import { MIN_HEALTH_FACTOR_FORM } from "../../../validation/index.js";
import { CreditAccountOperationsService } from "../index.js";
import { calcLeverageBand } from "../leverage-band.js";
import { assertDebtLimits, debtForLeverage } from "../math.js";
import {
  ANY,
  buildFixtureCreditAccount,
  buildMarketSdk,
  CREDIT_MANAGER,
  caToken,
  MAX_DEBT,
  POS,
  QUOTAS,
  UND,
  UND_DECIMALS,
} from "../testing/market.js";

/** The fixture market's threshold is 9200 bps, so `calcMaxLeverage` gives 11. */
const THRESHOLD_CEILING = 11;

const und = (whole: string) => toBN(whole, UND_DECIMALS);

function positionOf(
  sdk: OnchainSDK,
  creditAccount: ReturnType<typeof buildFixtureCreditAccount>,
): StrategyPosition {
  const suite = sdk.marketRegister.findCreditManager(CREDIT_MANAGER);
  const underlying = suite.underlyingToken;
  const totalValue = creditAccount.tokens.reduce(
    (sum, token) =>
      sum +
      suite.market.priceOracle.safeConvert(token.token, UND, token.balance)
        .value,
    0n,
  );
  return {
    kind: "strategy",
    name: "test strategy",
    chainId: sdk.chainId,
    creditManager: CREDIT_MANAGER,
    creditAccount: creditAccount.creditAccount,
    underlyingToken: underlying,
    targetCollateral: sdk.tokensMeta.mustGetToken(POS),
    leverage: 1,
    borrowApy: 0,
    totalDebt: suite.market.priceOracle.toTokenAmount(
      UND,
      creditAccount.totalDebt,
    ),
    totalValue: suite.market.priceOracle.toTokenAmount(UND, totalValue),
    healthFactor: 0,
    collaterals: creditAccount.tokens.map(token => ({
      collateral: suite.market.priceOracle.toTokenAmount(
        token.token,
        token.balance,
      ),
      quota: suite.market.priceOracle.toTokenAmount(UND, token.quota),
      withdrawals: [],
    })),
  };
}

function band(
  extras: {
    minDebt?: bigint;
    debtLimitAvailable?: bigint;
    quotas?: typeof QUOTAS;
  },
  collateral: { token: `0x${string}`; balance: bigint }[],
  targetHF?: number,
) {
  return calcLeverageBand({
    sdk: buildMarketSdk(extras),
    creditManager: CREDIT_MANAGER,
    collateral,
    targetHF,
  });
}

describe("calcLeverageBand", () => {
  const freshAccount = (
    overrides: {
      liquidity?: string;
      debtLimitAvailable?: string;
      maxDebt?: string;
      quotaAvailable?: string;
      quotaLimit?: string;
    } = {},
  ) => {
    const totalQuoted = und("503621");
    const sdk = buildMarketSdk({
      minDebt: und("150000"),
      debtLimitAvailable: und(overrides.debtLimitAvailable ?? "337510"),
      availableLiquidity: und(overrides.liquidity ?? "571013"),
      extraPrices: { [POS]: 225_581_506n },
      extraLiquidationThresholds: { [POS]: 8400 },
      quotas: {
        ...QUOTAS,
        [POS]: {
          ...QUOTAS[POS],
          limit:
            overrides.quotaLimit !== undefined
              ? und(overrides.quotaLimit)
              : totalQuoted + und(overrides.quotaAvailable ?? "4496379"),
          totalQuoted,
        },
      },
    });
    const suite = sdk.marketRegister.findCreditManager(CREDIT_MANAGER);
    suite.creditFacade.maxDebt = und(overrides.maxDebt ?? "5000000");
    const creditAccount = buildFixtureCreditAccount({
      totalDebt: und("184030.28"),
      tokens: [caToken(POS, und("244451.55"), und("231556.85"))],
    });
    return { sdk, suite, creditAccount };
  };

  it.each([
    { name: "baseline", expected: { min: 2.64, max: 5 } },
    {
      name: "one thousand of liquidity",
      liquidity: "1000",
      expected: { min: 2.64, max: 3.01 },
    },
    {
      name: "zero liquidity",
      liquidity: "0",
      expected: { min: 2.64, max: 3 },
    },
    {
      name: "250k absolute max debt",
      maxDebt: "250000",
      expected: { min: 2.64, max: 3.72 },
    },
    {
      name: "50k available quota",
      quotaAvailable: "50000",
      expected: { min: 2.64, max: 3.65 },
    },
    { name: "zero quota limit", quotaLimit: "0", expected: undefined },
    {
      name: "combined debt and quota ceilings",
      debtLimitAvailable: "50000",
      maxDebt: "350000",
      quotaAvailable: "30000",
      expected: { min: 2.64, max: 3.39 },
    },
  ])("matches the fresh account range with $name", testCase => {
    const { sdk, creditAccount } = freshAccount(testCase);

    expect(
      calcLeverageBand({
        sdk,
        creditManager: CREDIT_MANAGER,
        collateral: [],
        targetHF: MIN_HEALTH_FACTOR_FORM,
        position: positionOf(sdk, creditAccount),
      }),
    ).toEqual(testCase.expected);
  });

  it.each([
    { name: "baseline", expected: { min: 2.5, max: 4.37 } },
    {
      name: "180k liquidity",
      liquidity: "180000",
      expected: { min: 2.5, max: 2.8 },
    },
    {
      name: "180k manager capacity",
      debtLimitAvailable: "180000",
      expected: { min: 2.5, max: 2.8 },
    },
    {
      name: "180k available quota",
      quotaAvailable: "180000",
      expected: { min: 2.5, max: 2.8 },
    },
    {
      name: "quota below min debt",
      quotaAvailable: "149999",
      expected: undefined,
    },
  ])("matches the fresh opening range with $name", testCase => {
    const { sdk } = freshAccount(testCase);

    expect(
      calcLeverageBand({
        sdk,
        creditManager: CREDIT_MANAGER,
        collateral: [{ token: UND, balance: und("100000") }],
        targetHF: MIN_HEALTH_FACTOR_FORM,
      }),
    ).toEqual(testCase.expected);
  });

  it("retains 1.3x when debt rounding leaves exactly 100 USDC", () => {
    const sdk = buildMarketSdk({
      minDebt: 100_000_000n,
      debtLimitAvailable: 100_000_000n,
      extraDecimals: { [UND]: 6 },
    });
    const margin = 333_333_334n;
    expect(debtForLeverage(margin, 130n)).toBe(100_000_000n);
    expect(
      calcLeverageBand({
        sdk,
        creditManager: CREDIT_MANAGER,
        collateral: [{ token: UND, balance: margin }],
      }),
    ).toEqual({ min: 1.3, max: 1.3 });
    expect(debtForLeverage(margin, 131n)).toBeGreaterThan(100_000_000n);
  });

  it("inverts debt = netValue x (leverage - 1)", () => {
    // 10k of net value carries the 1k minimum at 1.1x; the threshold cuts the
    // top long before the 200k facade limit does
    expect(
      band({ minDebt: und("1000") }, [{ token: UND, balance: und("10000") }]),
    ).toEqual({ min: 1.1, max: THRESHOLD_CEILING });
  });

  it("takes the ceiling from a named target health factor", () => {
    // 9200 bps gives 11x at 1.01 as well, so only a target that moves the
    // answer proves it is read at all
    expect(
      band(
        { minDebt: und("1000") },
        [{ token: UND, balance: und("10000") }],
        12_000,
      ),
    ).toEqual({ min: 1.1, max: 4 });
  });

  it("stays quiet about a market it cannot resolve yet", () => {
    // a form asks on every keystroke, including while the SDK is still
    // attaching; an unanswerable question is not a crash
    const sdk = buildMarketSdk();
    vi.spyOn(sdk.marketRegister, "findCreditManager").mockImplementation(() => {
      throw new Error("unknown credit manager");
    });
    expect(
      calcLeverageBand({
        sdk,
        creditManager: CREDIT_MANAGER,
        collateral: [{ token: UND, balance: und("10000") }],
      }),
    ).toBeUndefined();
  });

  it("offers the whole track before a deposit is named", () => {
    expect(band({ minDebt: und("1000") }, [])).toEqual({
      min: 1,
      max: THRESHOLD_CEILING,
    });
    expect(
      band({ minDebt: und("1000") }, [{ token: UND, balance: 0n }]),
    ).toEqual({ min: 1, max: THRESHOLD_CEILING });
  });

  it("stops at what the manager may still borrow", () => {
    // 50k of allowance against 10k of net value is 6x, well under the ceiling
    expect(
      band({ minDebt: und("1000"), debtLimitAvailable: und("50000") }, [
        { token: UND, balance: und("10000") },
      ]),
    ).toEqual({ min: 1.1, max: 6 });
  });

  it("stops at the target collateral's available quota", () => {
    expect(
      band(
        {
          minDebt: und("1000"),
          quotas: {
            [POS]: {
              ...QUOTAS[POS],
              limit: und("20000"),
              totalQuoted: 0n,
            },
          },
        },
        [{ token: UND, balance: und("10000") }],
      ),
    ).toEqual({ min: 1.1, max: 3 });
  });

  it("keeps deleveraging reachable when an existing account has exhausted quota", () => {
    const sdk = buildMarketSdk({
      minDebt: und("1000"),
      quotas: {
        [POS]: {
          ...QUOTAS[POS],
          limit: und("20000"),
          totalQuoted: und("20000"),
        },
      },
    });
    const creditAccount = buildFixtureCreditAccount({
      totalDebt: und("20000"),
      tokens: [caToken(POS, und("30000"), und("27600"))],
    });
    expect(
      calcLeverageBand({
        sdk,
        creditManager: CREDIT_MANAGER,
        position: positionOf(sdk, creditAccount),
        collateral: [],
      }),
    ).toEqual({ min: 1.1, max: 3 });
  });

  it("rounds an existing account's quota ceiling to the last accepted hundredth", async () => {
    const sdk = buildMarketSdk({
      minDebt: und("1000"),
      quotas: {
        [POS]: {
          ...QUOTAS[POS],
          limit: und("20000"),
          totalQuoted: und("19500"),
        },
      },
    });
    const creditAccount = buildFixtureCreditAccount({
      totalDebt: und("20000"),
      tokens: [caToken(POS, und("30000"), und("27600"))],
    });
    const position = positionOf(sdk, creditAccount);
    expect(
      calcLeverageBand({
        sdk,
        creditManager: CREDIT_MANAGER,
        position,
        collateral: [],
      }),
    ).toEqual({ min: 1.1, max: 3.05 });

    const adjust = (targetLeverage: bigint) =>
      new CreditAccountOperationsService(sdk).startIntent({
        sdk,
        creditAccount,
        intent: { type: "ADJUST_LEVERAGE", targetLeverage, token: POS },
        quotaReserve: undefined,
        slippage: 0,
      });
    expect((await adjust(305n)).ok).toBe(true);
    const excess = await adjust(306n);
    expect(excess.ok).toBe(false);
    if (!excess.ok) expect(excess.error.code).toBe("quotaLimitReached");
  });

  it("caps adjust debt at the account max after adding available debt", () => {
    const sdk = buildMarketSdk({ minDebt: und("1000") });
    sdk.marketRegister.findCreditManager(CREDIT_MANAGER).creditFacade.maxDebt =
      und("25000");
    const creditAccount = buildFixtureCreditAccount({
      totalDebt: und("20000"),
      tokens: [caToken(POS, und("30000"), und("27600"))],
    });
    expect(
      calcLeverageBand({
        sdk,
        creditManager: CREDIT_MANAGER,
        position: positionOf(sdk, creditAccount),
        collateral: [],
      }),
    ).toEqual({ min: 1.1, max: 3.5 });
  });

  it("intersects adjust limits with the requested health-factor ceiling", () => {
    const sdk = buildMarketSdk({ minDebt: und("1000") });
    const creditAccount = buildFixtureCreditAccount({
      totalDebt: und("20000"),
      tokens: [caToken(POS, und("30000"), und("27600"))],
    });
    expect(
      calcLeverageBand({
        sdk,
        creditManager: CREDIT_MANAGER,
        position: positionOf(sdk, creditAccount),
        collateral: [],
        targetHF: 12_000,
      }),
    ).toEqual({ min: 1.1, max: 4 });
  });

  it("rounds the floor up and the ceiling down", () => {
    // 1k/30k is 0.0333.. and 100k/30k is 3.333..
    expect(
      band({ minDebt: und("1000"), debtLimitAvailable: und("100000") }, [
        { token: UND, balance: und("30000") },
      ]),
    ).toEqual({ min: 1.04, max: 4.33 });
  });

  it("prices collateral that is not the underlying", () => {
    // ANY is worth half of UND and carries ten more decimals, so 20k of it is
    // the 10k of net value the first case deposits directly
    expect(
      band({ minDebt: und("1000") }, [
        { token: ANY, balance: toBN("20000", 18) },
      ]),
    ).toEqual({ min: 1.1, max: THRESHOLD_CEILING });
  });

  it("offers nothing when the deposit cannot carry the minimum debt", () => {
    // 90 of net value needs 12.12x to owe 1k, and the threshold allows 11
    expect(
      band({ minDebt: und("1000") }, [{ token: UND, balance: und("90") }]),
    ).toBeUndefined();
  });

  it("offers nothing when the manager has no room left", () => {
    expect(
      band({ minDebt: und("1000"), debtLimitAvailable: und("500") }, [
        { token: UND, balance: und("10000") },
      ]),
    ).toBeUndefined();
  });

  it("keeps a band that is exactly one leverage wide", () => {
    // floor and ceiling meet at 2x: one setting is legal, and it is drawn
    expect(
      band({ minDebt: und("10000"), debtLimitAvailable: und("10000") }, [
        { token: UND, balance: und("10000") },
      ]),
    ).toEqual({ min: 2, max: 2 });
  });

  it("names no leverage that debtLimits would refuse", () => {
    // the trip a dialog makes: a leverage the slider reports, scaled the way
    // the client scales it, turned back into debt, checked by the guard that
    // refuses operations
    const scaleLeverage = (l: number): bigint =>
      BigInt(Math.round(l * Number(LEVERAGE_DECIMALS)));

    const cases = [
      {
        minDebt: und("1000"),
        available: MAX_DEBT,
        deposits: ["10000", "30000", "123457"],
      },
      { minDebt: und("1"), available: und("7"), deposits: ["2", "7"] },
      {
        minDebt: und("333"),
        available: und("999999"),
        deposits: ["1000", "250000"],
      },
      { minDebt: 0n, available: MAX_DEBT, deposits: ["10000"] },
    ];

    let checked = 0;
    for (const c of cases) {
      const sdk = buildMarketSdk({
        minDebt: c.minDebt,
        debtLimitAvailable: c.available,
      });
      const facade = { minDebt: c.minDebt, maxDebt: MAX_DEBT };
      for (const whole of c.deposits) {
        const netValue = und(whole);
        const reachable = calcLeverageBand({
          sdk,
          creditManager: CREDIT_MANAGER,
          collateral: [{ token: UND, balance: netValue }],
        });
        expect(reachable).toBeDefined();
        if (!reachable) continue;
        for (const leverage of [reachable.min, reachable.max]) {
          const debt = debtForLeverage(netValue, scaleLeverage(leverage));
          expect(() => assertDebtLimits(sdk, debt, facade, UND)).not.toThrow();
          checked += 1;
        }
      }
    }
    // every row must contribute, or the table has drifted out of reach
    expect(checked).toBe(cases.reduce((n, c) => n + c.deposits.length * 2, 0));
  });
});

describe("CreditAccountOperationsService.leverageBand", () => {
  it("is the same answer, reached the way a form reaches it", () => {
    const sdk = buildMarketSdk({ minDebt: und("1000") });
    const collateral = [{ token: UND, balance: und("10000") }];
    const props = { sdk, creditManager: CREDIT_MANAGER, collateral };

    expect(new CreditAccountOperationsService(sdk).leverageBand(props)).toEqual(
      calcLeverageBand(props),
    );
  });
});
