import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type { Token } from "../../model/index.js";
import {
  checkBorrowLimit,
  checkCollateralised,
  checkCreditManagerPaused,
  checkDebtInBand,
  checkForbiddenToken,
  checkFunding,
  checkLeverageAtLeastOne,
  checkMarketExpired,
  checkPoolPaused,
  checkPoolPayout,
  checkPoolSunset,
  checkPreviewError,
  checkQuotaCount,
  checkQuotaLimit,
  isMalformedPreviewError,
  MIN_HEALTH_FACTOR_FACADE,
  MIN_HEALTH_FACTOR_FORM,
} from "./checks.js";

const CM = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as Address;
const POOL = "0xcccccccccccccccccccccccccccccccccccccccc" as Address;

const token = (address: string, symbol = "TKN"): Token => ({
  chainId: 1,
  address: address as Address,
  symbol,
  name: symbol,
  decimals: 18,
});

const UND = token("0x9999999999999999999999999999999999999999", "UND");
const TOK = token("0x1111111111111111111111111111111111111111");

describe("checkCreditManagerPaused / checkMarketExpired", () => {
  it("passes an operable manager", () => {
    expect(
      checkCreditManagerPaused({ isPaused: false, creditManager: CM }),
    ).toBeNull();
    expect(
      checkMarketExpired({
        isExpired: false,
        creditManager: CM,
        expirationDate: 0,
      }),
    ).toBeNull();
  });

  it("names the manager that is paused", () => {
    expect(
      checkCreditManagerPaused({ isPaused: true, creditManager: CM }),
    ).toEqual({ reason: "marketPaused", detail: { creditManager: CM } });
  });

  it("names the manager that expired, and when", () => {
    expect(
      checkMarketExpired({
        isExpired: true,
        creditManager: CM,
        expirationDate: 1000,
      }),
    ).toEqual({
      reason: "marketExpired",
      detail: { creditManager: CM, expirationDate: 1000 },
    });
  });
});

describe("checkPoolPaused / checkPoolSunset", () => {
  it("names the pool rather than a manager", () => {
    expect(checkPoolPaused({ isPaused: true, pool: POOL })).toEqual({
      reason: "marketPaused",
      detail: { pool: POOL },
    });
    expect(checkPoolPaused({ isPaused: false, pool: POOL })).toBeNull();
  });

  it("refuses a deposit into a sunset pool but lets the payout through", () => {
    expect(
      checkPoolSunset({ isSunset: true, isDeposit: true, pool: POOL }),
    ).toEqual({ reason: "poolSunset", detail: { pool: POOL } });
    expect(
      checkPoolSunset({ isSunset: true, isDeposit: false, pool: POOL }),
    ).toBeNull();
    expect(
      checkPoolSunset({ isSunset: false, isDeposit: true, pool: POOL }),
    ).toBeNull();
  });
});

describe("checkBorrowLimit", () => {
  const at = (requested: bigint, available: bigint) =>
    checkBorrowLimit({
      requested,
      available,
      binding: "poolAvailableLiquidity",
      underlying: UND,
    });

  it("accepts a draw that exactly exhausts the ceiling", () => {
    expect(at(100n, 100n)).toBeNull();
  });

  it("names both sides and which ceiling bound", () => {
    expect(at(101n, 100n)).toEqual({
      reason: "insufficientPoolLiquidity",
      detail: {
        requested: { token: UND, value: 101n, valueUsd: null },
        available: { token: UND, value: 100n, valueUsd: null },
        binding: "poolAvailableLiquidity",
      },
    });
  });

  it("carries the position still openable only when there is one", () => {
    const withSolution = checkBorrowLimit({
      requested: 101n,
      available: 100n,
      binding: "poolDebtLimit",
      underlying: UND,
      solutionAmount: 50n,
    });
    expect(withSolution?.detail).toMatchObject({
      solutionAmount: { token: UND, value: 50n, valueUsd: null },
    });
    expect(at(101n, 100n)?.detail).not.toHaveProperty("solutionAmount");
  });
});

describe("checkDebtInBand", () => {
  const band = { minDebt: 100n, maxDebt: 10_000n, underlying: UND };
  const at = (debt: bigint, allowZero: boolean) =>
    checkDebtInBand({ ...band, debt, allowZero });

  it("accepts the band's own endpoints", () => {
    expect(at(100n, true)).toBeNull();
    expect(at(10_000n, true)).toBeNull();
  });

  it("refuses either side of the band and reports all three numbers", () => {
    expect(at(10_001n, true)).toEqual({
      reason: "debtOutOfRange",
      detail: {
        requested: { token: UND, value: 10_001n, valueUsd: null },
        minDebt: { token: UND, value: 100n, valueUsd: null },
        maxDebt: { token: UND, value: 10_000n, valueUsd: null },
      },
    });
    expect(at(99n, true)?.reason).toBe("debtOutOfRange");
  });

  it("exempts a zero debt only where the caller says so", () => {
    // An adjustment may end owing nothing; an opening may not.
    expect(at(0n, true)).toBeNull();
    expect(at(0n, false)?.reason).toBe("debtOutOfRange");
  });
});

describe("checkLeverageAtLeastOne", () => {
  it("draws the line at 1x itself", () => {
    expect(checkLeverageAtLeastOne({ leverage: 100n, min: 100n })).toBeNull();
    expect(checkLeverageAtLeastOne({ leverage: 99n, min: 100n })).toEqual({
      reason: "leverageOutOfRange",
      detail: { requested: 99n, min: 100n },
    });
  });
});

describe("checkCollateralised", () => {
  const at = (healthFactor: number | undefined, required: number) =>
    checkCollateralised({ healthFactor, required, safePrices: false });

  it("accepts a factor exactly at the bar, at either bar", () => {
    expect(at(MIN_HEALTH_FACTOR_FACADE, MIN_HEALTH_FACTOR_FACADE)).toBeNull();
    expect(at(MIN_HEALTH_FACTOR_FORM, MIN_HEALTH_FACTOR_FORM)).toBeNull();
  });

  it("keeps the two bars apart", () => {
    // 10100 is what the legacy form validator refused and the facade allowed.
    expect(at(10_100, MIN_HEALTH_FACTOR_FACADE)).toBeNull();
    expect(at(10_100, MIN_HEALTH_FACTOR_FORM)?.reason).toBe(
      "insufficientCollateral",
    );
  });

  it("treats an unread factor as failing", () => {
    expect(at(undefined, MIN_HEALTH_FACTOR_FACADE)).toEqual({
      reason: "insufficientCollateral",
      detail: {
        healthFactor: 0,
        required: MIN_HEALTH_FACTOR_FACADE,
        safePrices: false,
      },
    });
  });

  it("passes the zero-debt sentinel at every bar", () => {
    expect(at(65_535, MIN_HEALTH_FACTOR_FORM)).toBeNull();
  });

  it("lets an operation that raises the factor through from under the bar", () => {
    // The account is already below; the top-up that rescues it must not be
    // refused by the check meant to protect it.
    expect(
      checkCollateralised({
        healthFactor: 10_080,
        required: MIN_HEALTH_FACTOR_FORM,
        safePrices: false,
        improvesFrom: 10_050,
      }),
    ).toBeNull();
  });

  it("still refuses when the operation does not raise it", () => {
    const at = (improvesFrom: number) =>
      checkCollateralised({
        healthFactor: 10_080,
        required: MIN_HEALTH_FACTOR_FORM,
        safePrices: false,
        improvesFrom,
      });

    expect(at(10_080)?.reason).toBe("insufficientCollateral");
    expect(at(10_090)?.reason).toBe("insufficientCollateral");
  });

  it("refuses an unread factor whatever the account stands at", () => {
    expect(
      checkCollateralised({
        healthFactor: undefined,
        required: MIN_HEALTH_FACTOR_FORM,
        safePrices: false,
        improvesFrom: 1,
      })?.reason,
    ).toBe("insufficientCollateral");
  });

  it("records which pricing the factor was read at", () => {
    const issue = checkCollateralised({
      healthFactor: 1,
      required: MIN_HEALTH_FACTOR_FACADE,
      safePrices: true,
    });
    expect(issue?.detail).toMatchObject({ safePrices: true });
  });
});

describe("checkForbiddenToken", () => {
  it("names the token the market forbids", () => {
    expect(checkForbiddenToken({ token: TOK, isForbidden: true })).toEqual({
      reason: "forbiddenToken",
      detail: { token: TOK },
    });
    expect(checkForbiddenToken({ token: TOK, isForbidden: false })).toBeNull();
  });
});

describe("checkQuotaLimit / checkQuotaCount", () => {
  it("allows an increase that exactly exhausts the headroom", () => {
    const at = (requested: bigint) =>
      checkQuotaLimit({
        token: TOK,
        requested,
        available: 500n,
        underlying: UND,
      });

    expect(at(500n)).toBeNull();
    expect(at(501n)?.reason).toBe("quotaLimitReached");
  });

  it("reports no ceiling at all for a token the market quotes nothing for", () => {
    expect(
      checkQuotaLimit({
        token: TOK,
        requested: undefined,
        available: 0n,
        underlying: UND,
      }),
    ).toEqual({
      reason: "quotaLimitReached",
      detail: {
        token: TOK,
        requested: undefined,
        available: { token: UND, value: 0n, valueUsd: null },
      },
    });
  });

  it("counts quoted tokens with `>`, so count === max is allowed", () => {
    expect(checkQuotaCount({ count: 2, max: 2 })).toBeNull();
    expect(checkQuotaCount({ count: 3, max: 2 })).toEqual({
      reason: "quotaCountExceeded",
      detail: { count: 3, max: 2 },
    });
  });
});

describe("checkFunding", () => {
  it("accepts a balance that exactly covers the amount", () => {
    expect(checkFunding({ token: TOK, required: 100n, held: 100n })).toBeNull();
  });

  it("names both sides of the shortfall", () => {
    expect(checkFunding({ token: TOK, required: 100n, held: 1n })).toEqual({
      reason: "insufficientSourceBalance",
      detail: {
        required: { token: TOK, value: 100n, valueUsd: null },
        held: { token: TOK, value: 1n, valueUsd: null },
      },
    });
  });
});

describe("checkPreviewError", () => {
  it("blocks a malformed transaction and carries the SDK's own detail", () => {
    expect(checkPreviewError({ code: 1002, message: "bad bracket" })).toEqual({
      reason: "malformedTransaction",
      detail: { code: 1002, message: "bad bracket" },
    });
  });

  it("stands down for an incomplete evaluation and for no error at all", () => {
    expect(checkPreviewError({ code: 2001, message: "no price" })).toBeNull();
    expect(checkPreviewError(undefined)).toBeNull();
  });

  it("classifies by range, so an unseen 1xxx code still blocks", () => {
    expect(isMalformedPreviewError({ code: 1007 })).toBe(true);
    expect(isMalformedPreviewError({ code: 999 })).toBe(false);
    expect(isMalformedPreviewError({ code: 2000 })).toBe(false);
  });
});

describe("checkPoolPayout", () => {
  const at = (requested: bigint, available: bigint) =>
    checkPoolPayout({ requested, available, underlying: UND });

  it("refuses a payout the pool exactly holds", () => {
    // Not `checkBorrowLimit`'s operator: equality is already a refusal here,
    // which is the rule the legacy withdrawal validator enforced.
    expect(at(100n, 100n)).toEqual({
      reason: "insufficientPoolLiquidity",
      detail: {
        requested: { token: UND, value: 100n, valueUsd: null },
        available: { token: UND, value: 100n, valueUsd: null },
        binding: "poolAvailableLiquidity",
      },
    });
  });

  it("serves a payout the pool has room above", () => {
    expect(at(99n, 100n)).toBeNull();
  });
});
