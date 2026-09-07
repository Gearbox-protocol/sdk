import { describe, expect, it, vi } from "vitest";
import {
  leverageLimits,
  withdrawCollateralLimits,
  withdrawStrategyLimits,
} from "./limits.js";
import {
  buildFixtureCreditAccount,
  buildMarketSdk,
  CREDIT_MANAGER,
  caToken,
  POS,
  PRICES,
  UND,
} from "./testing/market.js";

const unit = 10n ** 8n;
const ca = buildFixtureCreditAccount({
  totalDebt: 50n * unit,
  tokens: [caToken(POS, 100n * unit, 1000n * unit)],
});
const collateralProps = { creditAccount: ca, token: POS, targetHF: 10_000n };

describe("preliminary operation limits", () => {
  it("keeps an empty enabled mask authoritative", () => {
    const report = withdrawCollateralLimits({
      ...collateralProps,
      sdk: buildMarketSdk({ forbiddenTokens: [POS] }),
      creditAccount: { ...ca, enabledTokensMask: 0n },
    });
    expect(report).toMatchObject({ max: 0n, useSafePrices: true });
    expect(report.constraints).toContainEqual({
      id: "forbiddenTokens",
      status: "notApplicable",
    });
  });
  it("reduces the collateral ceiling when reserve value falls", () => {
    const report = (reserve: bigint) =>
      withdrawCollateralLimits({
        ...collateralProps,
        sdk: buildMarketSdk({ reservePrices: { ...PRICES, [POS]: reserve } }),
      });
    // Holding 100, debt 50 and LT .92 needs 54.35 tokens at $2, more at $1.5.
    const fullPriceMax = report(200_000_000n).max;
    if (fullPriceMax === undefined) throw new Error("Expected known cap");
    expect(report(150_000_000n).max).toBeLessThan(fullPriceMax);
    expect(report(150_000_000n).complete).toBe(false);
    expect(report(150_000_000n).constraints).toContainEqual(
      expect.objectContaining({ id: "quota", status: "unresolved" }),
    );
  });

  it("distinguishes absent reserve (zero collateral) from unavailable feed", () => {
    const sdk = buildMarketSdk({ reservePrices: {} });
    const props = { sdk, ...collateralProps };
    expect(withdrawCollateralLimits(props).constraints).toContainEqual({
      id: "collateral",
      status: "calculated",
      max: 0n,
    });
    const oracle =
      sdk.marketRegister.findCreditManager(CREDIT_MANAGER).market.priceOracle;
    const failed = oracle.safeConvertMinUSD(
      "0x0000000000000000000000000000000000000000",
      unit,
    );
    expect(failed.error).toBeDefined();
    vi.spyOn(oracle, "safeConvertMinUSD").mockReturnValue(failed);
    const unavailable = withdrawCollateralLimits(props);
    expect(unavailable.max).toBe(100n * unit); // Only the balance remains known.
    expect(unavailable.constraints).toContainEqual(
      expect.objectContaining({ id: "collateral", status: "unresolved" }),
    );
  });

  it("keeps the partial minDebt ceiling separate from full exit", () => {
    const report = withdrawStrategyLimits({
      sdk: buildMarketSdk({ minDebt: 40n * unit }),
      creditAccount: ca,
    });
    expect(report.token).toBe(UND);
    expect(report.max).toBe(10n * unit);
    expect(report.exit).toBe(50n * unit);
    expect(report.constraints).toContainEqual(
      expect.objectContaining({ id: "route", status: "unresolved" }),
    );
  });

  it("uses the main feed for underlying even without reserves", () => {
    const report = withdrawCollateralLimits({
      sdk: buildMarketSdk({ reservePrices: {} }),
      creditAccount: buildFixtureCreditAccount({
        totalDebt: 50n * unit,
        tokens: [caToken(UND, 100n * unit, 0n)],
      }),
      token: UND,
      targetHF: 10_000n,
    });
    expect(report.max).toBeGreaterThan(0n);
  });

  it("reports separate leverage caps in native leverage units", () => {
    const report = leverageLimits({
      sdk: buildMarketSdk({
        minDebt: 10n * unit,
        availableLiquidity: 20n * unit,
        debtLimitAvailable: 30n * unit,
      }),
      creditManager: CREDIT_MANAGER,
      collateral: [{ token: UND, balance: 10n * unit }],
    });
    expect(report.max).toBe(3);
    expect(report.min).toBe(2);
    expect(report.constraints).toContainEqual({
      id: "poolLiquidity",
      status: "calculated",
      max: 3,
    });
    expect(report.constraints).toContainEqual({
      id: "creditManagerDebtLimit",
      status: "calculated",
      max: 4,
    });
    expect(report.complete).toBe(false);
  });

  it("never presents price read failure as a zero strategy withdrawal", () => {
    const sdk = buildMarketSdk();
    vi.spyOn(
      sdk.marketRegister.findCreditManager(CREDIT_MANAGER).market.priceOracle,
      "safeConvert",
    ).mockImplementation(() => {
      throw new Error("unavailable");
    });
    expect(withdrawStrategyLimits({ sdk, creditAccount: ca })).toMatchObject({
      max: undefined,
      exit: undefined,
      complete: false,
    });
  });

  it("leaves forbidden-token eligibility unresolved even for dust and zero", () => {
    for (const balance of [0n, 1n, 100n * unit]) {
      const creditAccount = {
        ...ca,
        enabledTokensMask: 2n,
        tokens: [{ ...caToken(POS, balance, 0n), mask: 2n }],
      };
      const report = withdrawCollateralLimits({
        ...collateralProps,
        sdk: buildMarketSdk({ forbiddenTokens: [POS] }),
        creditAccount,
      });
      expect(report.complete).toBe(false);
      expect(report.constraints).toContainEqual(
        expect.objectContaining({
          id: "forbiddenTokens",
          status: "unresolved",
        }),
      );
    }
  });

  it("counts underlying independently of the enabled collateral mask", () => {
    const creditAccount = {
      ...ca,
      enabledTokensMask: 2n,
      tokens: [
        { ...caToken(POS, 100n * unit, 1000n * unit), mask: 2n },
        { ...caToken(UND, 100n * unit, 0n), mask: 1n },
      ],
    };
    expect(
      withdrawCollateralLimits({
        ...collateralProps,
        sdk: buildMarketSdk(),
        creditAccount,
      }).max,
    ).toBe(100n * unit);
  });

  it("uses 255 to disable the block cap and zero to disable borrowing", () => {
    const report = (multiplier: number) =>
      leverageLimits({
        sdk: buildMarketSdk({ maxDebtPerBlockMultiplier: multiplier }),
        creditManager: CREDIT_MANAGER,
        collateral: [{ token: UND, balance: unit }],
      });
    expect(report(255).constraints).toContainEqual({
      id: "blockBorrowLimit",
      status: "notApplicable",
    });
    expect(report(0).max).toBe(1);
  });

  it("preserves independent threshold and block applicability when valuation fails", () => {
    const sdk = buildMarketSdk({ maxDebtPerBlockMultiplier: 255 });
    vi.spyOn(
      sdk.marketRegister.findCreditManager(CREDIT_MANAGER).market.priceOracle,
      "safeConvert",
    ).mockImplementation(() => {
      throw new Error("unavailable");
    });
    const report = leverageLimits({
      sdk,
      creditManager: CREDIT_MANAGER,
      collateral: [{ token: POS, balance: unit }],
    });
    expect(report.max).toBe(11);
    expect(report.constraints).toContainEqual(
      expect.objectContaining({ id: "valuation", status: "unresolved" }),
    );
    expect(report.constraints).toContainEqual({
      id: "blockBorrowLimit",
      status: "notApplicable",
    });
    expect(report.constraints.some(c => c.id === "maxDebt")).toBe(false);
  });
});
