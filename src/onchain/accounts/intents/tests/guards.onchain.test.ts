import { describe, expect, it } from "vitest";
import { PERCENTAGE_FACTOR } from "../../../constants/index.js";
import type { OnchainSDK } from "../../../index.js";
import { toBN } from "../../../index.js";
import { CreditAccountOperationsService } from "../index.js";
import { expectPreviewError } from "../testing/expect.js";
import {
  buildFixtureCreditAccount,
  buildMarketSdk,
  CREDIT_MANAGER,
  caToken,
  MAX_DEBT,
  type MarketSdkExtras,
  POS,
  POS2,
  QUOTAS,
  UND,
  WALLET,
} from "../testing/market.js";
import type { IntentPreviewResult, StartIntent } from "../types.js";

/**
 * What the market refuses before the arithmetic is even asked.
 *
 * These are the reverts a form cannot read: a paused facade, an expired one, a
 * pool with nothing left to lend, a quota that has hit its ceiling, a token the
 * market forbids. The engine reads them off the loaded market and answers with
 * a reason instead of building calldata that would revert.
 *
 * The account behind every case is the same 1000 UND position against 500 of
 * debt — 2x — so the only thing under test is the market it sits in.
 */

const TVL = 100000000000n;
const DEBT = 50000000000n;
const QUOTA = (TVL * 9200n) / 10000n;

function run(
  intent: StartIntent,
  extras?: MarketSdkExtras,
  sdkOverride?: OnchainSDK,
): Promise<IntentPreviewResult> {
  const sdk = sdkOverride ?? buildMarketSdk(extras);
  return new CreditAccountOperationsService(sdk).startIntent({
    intent,
    creditAccount: buildFixtureCreditAccount({
      accountDebt: DEBT,
      tokens: [caToken(POS, TVL, QUOTA)],
    }),
    sdk,
    quotaReserve: undefined,
    slippage: undefined,
  });
}

/** Doubling leverage, which is the flow that draws new debt. */
const lever: StartIntent = {
  type: "ADJUST_LEVERAGE",
  targetLeverage: 300n,
  token: POS,
};
/** A withdrawal, which draws nothing and touches no new token. */
const withdraw: StartIntent = { type: "WITHDRAW", amount: 100n, to: WALLET };

describe("market guards — what no plan can talk its way past", () => {
  it("a paused facade stops everything, withdrawals included", async () => {
    expectPreviewError(
      await run(withdraw, { facadePaused: true }),
      "marketPaused",
    );
  });

  it("a paused pool pauses the suite that borrows from it", async () => {
    expectPreviewError(
      await run(withdraw, { poolPaused: true }),
      "marketPaused",
    );
  });

  it("past its expiration the facade takes no multicall", async () => {
    expectPreviewError(
      await run(withdraw, { expirationDate: 1000, timestamp: 2000 }),
      "marketExpired",
    );
  });

  it("an expiry still ahead is no obstacle", async () => {
    const result = await run(withdraw, {
      expirationDate: 3000,
      timestamp: 2000,
    });

    expect(result.ok).toBe(true);
  });
});

describe("borrow guards — what the pool will actually lend", () => {
  it("refuses a draw the pool has no liquidity for", async () => {
    expectPreviewError(
      await run(lever, { availableLiquidity: DEBT - 1n }),
      "insufficientPoolLiquidity",
    );
  });

  it("refuses a draw past what is left of the manager's debt limit", async () => {
    expectPreviewError(
      await run(lever, { debtLimitAvailable: DEBT - 1n }),
      "insufficientPoolLiquidity",
    );
  });

  it("refuses every draw when borrowing is switched off for the block", async () => {
    expectPreviewError(
      await run(lever, { maxDebtPerBlockMultiplier: 0 }),
      "insufficientPoolLiquidity",
    );
  });

  it("leaves a draw the pool can cover alone", async () => {
    const result = await run(lever, { availableLiquidity: DEBT });

    expect(result.ok).toBe(true);
  });

  it("says nothing about a flow that draws no debt", async () => {
    const result = await run(withdraw, { availableLiquidity: 0n });

    expect(result.ok).toBe(true);
  });
});

describe("quota guards — the ceiling the keeper enforces", () => {
  it("refuses a position the market has no quota left for", async () => {
    expectPreviewError(
      await run(lever, {
        quotas: {
          ...QUOTAS,
          [POS]: { ...QUOTAS[POS], limit: QUOTA, totalQuoted: QUOTA },
        },
      }),
      "quotaLimitReached",
    );
  });

  it("refuses a token whose quota the market has switched off", async () => {
    expectPreviewError(
      await run(lever, {
        quotas: { ...QUOTAS, [POS]: { ...QUOTAS[POS], isActive: false } },
      }),
      "quotaLimitReached",
    );
  });

  it("says nothing when the plan only gives quota back", async () => {
    const result = await run(
      { type: "ADJUST_LEVERAGE", targetLeverage: 150n, token: POS },
      {
        quotas: {
          ...QUOTAS,
          [POS]: { ...QUOTAS[POS], limit: QUOTA, totalQuoted: QUOTA },
        },
      },
    );

    expect(result.ok).toBe(true);
  });
});

describe("forbidden tokens — sellable, but never bought", () => {
  it("refuses a plan that would buy more of one", async () => {
    expectPreviewError(
      await run(lever, { forbiddenTokens: [POS] }),
      "forbiddenToken",
    );
  });

  it("lets a plan sell one down, which is the way out of it", async () => {
    const result = await run(
      { type: "ADJUST_LEVERAGE", targetLeverage: 150n, token: POS },
      { forbiddenTokens: [POS] },
    );

    expect(result.ok).toBe(true);
  });

  it("says nothing about a forbidden token the plan never touches", async () => {
    const result = await run(lever, { forbiddenTokens: [POS2] });

    expect(result.ok).toBe(true);
  });
});

describe("collateral check — where the transaction has to end", () => {
  /** 1000 UND of idle underlying against 500 of debt, weighted at 98%. */
  function withUnderlying(
    amount: bigint,
    extras?: MarketSdkExtras,
  ): Promise<IntentPreviewResult> {
    const sdk = buildMarketSdk(extras);
    return new CreditAccountOperationsService(sdk).startIntent({
      intent: {
        type: "WITHDRAW_ASSET",
        token: UND,
        amount,
        to: WALLET,
      },
      creditAccount: buildFixtureCreditAccount({
        accountDebt: DEBT,
        tokens: [caToken(UND, TVL)],
      }),
      sdk,
      quotaReserve: undefined,
      slippage: undefined,
    });
  }

  it("refuses a withdrawal that leaves the debt uncovered", async () => {
    // 400 UND left at 98% is 392 against 500 of debt
    expectPreviewError(
      await withUnderlying(60000000000n),
      "insufficientCollateral",
    );
  });

  it("allows the withdrawal that stops short of it", async () => {
    const result = await withUnderlying(40000000000n);

    expect(result.ok).toBe(true);
  });

  it("judges a payout by the lower of the two feeds", async () => {
    // 600 UND left is comfortable at the main price of 2 — 588 against 500 —
    // and short of the debt at the reserve price of 1.5, which is the one the
    // credit manager reads on a call that hands funds over.
    expectPreviewError(
      await withUnderlying(40000000000n, {
        reservePrices: { [UND]: toBN("1.5", 8) },
      }),
      "insufficientCollateral",
    );
  });

  it("keeps the main price where the reserve feed agrees", async () => {
    const result = await withUnderlying(40000000000n, {
      reservePrices: { [UND]: toBN("2", 8) },
    });

    expect(result.ok).toBe(true);
  });
});

describe("openStrategy — the same market, read before there is an account", () => {
  function open(extras?: MarketSdkExtras) {
    const sdk = buildMarketSdk(extras);
    return new CreditAccountOperationsService(sdk).openStrategyIntent({
      sdk,
      creditManager: buildFixtureCreditAccount({ accountDebt: 0n, tokens: [] })
        .creditManager,
      collateral: [{ token: UND, balance: DEBT }],
      targetToken: POS,
      leverage: 200n,
      slippage: undefined,
      quotaReserve: undefined,
    });
  }

  it("refuses to open in a paused market", async () => {
    expect(await open({ facadePaused: true })).toMatchObject({
      ok: false,
      reason: "marketPaused",
      detail: { creditManager: CREDIT_MANAGER },
    });
  });

  it("refuses to open beyond what the pool can lend", async () => {
    expect(await open({ availableLiquidity: DEBT - 1n })).toMatchObject({
      ok: false,
      reason: "insufficientPoolLiquidity",
    });
  });

  it("refuses to open a position the market forbids holding", async () => {
    expect(await open({ forbiddenTokens: [POS] })).toMatchObject({
      ok: false,
      reason: "forbiddenToken",
      detail: { token: { address: POS } },
    });
  });

  it("opens when the market has room, which the debt band still bounds", async () => {
    const result = await open();

    expect(result.ok).toBe(true);
    expect(MAX_DEBT).toBeGreaterThan(DEBT);
  });
});

/** Each refusal carries the numbers a form would otherwise re-derive. */
describe("refusal details", () => {
  it("an expired market names the date it expired at", async () => {
    const result = await run(withdraw, {
      expirationDate: 1000,
      timestamp: 2000,
    });

    if (result.ok || result.reason !== "marketExpired") {
      throw new Error("expected marketExpired");
    }
    expect(result.detail).toEqual({
      creditManager: CREDIT_MANAGER,
      expirationDate: 1000,
    });
  });

  it("a dry pool names what was asked for and what is there", async () => {
    const result = await run(lever, { maxDebtPerBlockMultiplier: 0 });

    if (result.ok || result.reason !== "insufficientPoolLiquidity") {
      throw new Error("expected insufficientPoolLiquidity");
    }
    expect(result.detail.available).toEqual({
      token: expect.objectContaining({ address: UND }),
      value: 0n,
      valueUsd: null,
    });
    expect(result.detail.requested.token.address).toBe(UND);
    expect(result.detail.requested.value).toBeGreaterThan(0n);
    expect(result.detail.binding).toBe("facadePerBlockCap");
  });

  it("a spent quota names the token, and the room in underlying", async () => {
    const result = await run(lever, {
      quotas: {
        ...QUOTAS,
        [POS]: { ...QUOTAS[POS], limit: QUOTA, totalQuoted: QUOTA },
      },
    });

    if (result.ok || result.reason !== "quotaLimitReached") {
      throw new Error("expected quotaLimitReached");
    }
    // The quoted token and the amounts are different tokens: a quota is
    // measured in the underlying.
    expect(result.detail.token.address).toBe(POS);
    expect(result.detail.available).toEqual({
      token: expect.objectContaining({ address: UND }),
      value: 0n,
      valueUsd: null,
    });
    expect(result.detail.requested?.token.address).toBe(UND);
  });

  it("a token the market quotes nothing for reports no ceiling at all", async () => {
    const result = await run(lever, {
      quotas: { ...QUOTAS, [POS]: { ...QUOTAS[POS], isActive: false } },
    });

    if (result.ok || result.reason !== "quotaLimitReached") {
      throw new Error("expected quotaLimitReached");
    }
    expect(result.detail.requested).toBeUndefined();
    expect(result.detail.available).toEqual({
      token: expect.objectContaining({ address: UND }),
      value: 0n,
      valueUsd: null,
    });
  });

  it("a forbidden token names itself", async () => {
    const result = await run(lever, { forbiddenTokens: [POS] });

    if (result.ok || result.reason !== "forbiddenToken") {
      throw new Error("expected forbiddenToken");
    }
    expect(result.detail).toEqual({
      token: expect.objectContaining({ address: POS }),
    });
  });

  it("an uncovered debt names the factor reached, and which feed it came from", async () => {
    // Funds leave, so the check judged safe prices — which is not the factor a
    // preview reports.
    const sdk = buildMarketSdk();
    const result = await new CreditAccountOperationsService(sdk).startIntent({
      intent: {
        type: "WITHDRAW_ASSET",
        token: UND,
        amount: 60000000000n,
        to: WALLET,
      },
      creditAccount: buildFixtureCreditAccount({
        accountDebt: DEBT,
        tokens: [caToken(UND, TVL)],
      }),
      sdk,
      quotaReserve: undefined,
      slippage: undefined,
    });

    if (result.ok || result.reason !== "insufficientCollateral") {
      throw new Error("expected insufficientCollateral");
    }
    expect(result.detail.safePrices).toBe(true);
    expect(result.detail.required).toBe(Number(PERCENTAGE_FACTOR));
    expect(result.detail.healthFactor).toBeLessThan(result.detail.required);
  });
});
