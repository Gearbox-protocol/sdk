import { describe, expect, it } from "vitest";
import type { OnchainSDK } from "../../../index.js";
import { toBN } from "../../../index.js";
import { CreditAccountOperationsService } from "../index.js";
import { expectPreviewError } from "../testing/expect.js";
import {
  buildFixtureCreditAccount,
  buildMarketSdk,
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
    expect(await open({ facadePaused: true })).toEqual({
      ok: false,
      reason: "marketPaused",
    });
  });

  it("refuses to open beyond what the pool can lend", async () => {
    expect(await open({ availableLiquidity: DEBT - 1n })).toEqual({
      ok: false,
      reason: "insufficientPoolLiquidity",
    });
  });

  it("refuses to open a position the market forbids holding", async () => {
    expect(await open({ forbiddenTokens: [POS] })).toEqual({
      ok: false,
      reason: "forbiddenToken",
    });
  });

  it("opens when the market has room, which the debt band still bounds", async () => {
    const result = await open();

    expect(result.ok).toBe(true);
    expect(MAX_DEBT).toBeGreaterThan(DEBT);
  });
});
