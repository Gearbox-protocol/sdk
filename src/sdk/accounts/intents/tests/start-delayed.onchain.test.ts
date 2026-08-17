import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type { OnchainSDK } from "../../../index.js";
import { CreditAccountOperationsService } from "../index.js";
import {
  assetBalance,
  expectAdjustPreview,
  expectPreviewError,
  withOnchainOpCalls,
} from "../testing/expect.js";
import {
  ANY,
  buildFixtureCreditAccount,
  buildMarketSdk,
  caToken,
  POS,
  POS2,
  UND,
  WALLET,
} from "../testing/market.js";
import {
  CA_OP_CALLS,
  MOCK_REQUEST_CALL,
  type MockDelayedVenue,
} from "../testing/sdk-mock.js";
import type { DelayableIntent } from "../types.js";
import {
  DEBT_BEFORE,
  QUOTA_BEFORE,
  TVL_BEFORE,
  W,
} from "./withdraw.fixtures.js";

/**
 * The leading half of the two intents that sell a position asset, when that
 * asset only redeems through its issuer.
 *
 * Same market as the instant withdraw specs — 2000 UND of TVL against 1000 of
 * debt, `POS` 1:1 with `UND` — so the amounts read against them directly: what
 * the instant flow would have swapped is what the request redeems. `POS2` plays
 * the withdrawal phantom token, being 1:1 with `POS` and already quotable, so
 * the in-flight position keeps its value in the projected state.
 */

const PHANTOM = POS2;
const CLAIMABLE_AT = 1_772_000_000n;

/** A venue with no liquidity of its own: the whole request is queued. */
const queued: MockDelayedVenue = {
  withdrawalPhantomToken: PHANTOM,
  claimableAt: CLAIMABLE_AT,
};

/** A venue that serves half on the spot and queues the rest. */
const halfLiquid: MockDelayedVenue = {
  withdrawalPhantomToken: PHANTOM,
  claimableAt: CLAIMABLE_AT,
  outputs: amount => [
    { token: UND, amount: amount / 2n, isDelayed: false },
    { token: PHANTOM, amount: amount / 2n, isDelayed: true },
  ],
};

function buildSdk(venues?: Record<Address, MockDelayedVenue[]>): OnchainSDK {
  return buildMarketSdk({ delayed: venues ?? { [POS]: [queued] } });
}

function run(
  intent: DelayableIntent,
  sdk: OnchainSDK,
  tokens = [caToken(POS, TVL_BEFORE, QUOTA_BEFORE)],
) {
  const service = new CreditAccountOperationsService(sdk);
  return service.startDelayedIntent({
    intent,
    creditAccount: buildFixtureCreditAccount({
      accountDebt: DEBT_BEFORE,
      tokens,
    }),
    sdk,
    quotaReserve: undefined,
    slippage: undefined,
  });
}

describe("withdraw.startDelayed — request now, settle after the delay", () => {
  it("redeems payout plus repayment, and records what the tail owes", async () => {
    const result = await run(
      { type: "WITHDRAW", amount: W, to: WALLET },
      buildSdk(),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("expected ok delayed preview");
    }

    expect(result.operations[0]).toMatchObject({
      type: "startDelayedWithdrawal",
      token: POS,
      // W of payout plus the proportional dD of debt, priced into the source.
      amountIn: 2n * W,
      settlement: "delayed",
    });
    expect(result.delayed).toEqual({
      record: {
        type: "WITHDRAW_COLLATERAL",
        to: WALLET,
        withdrawToken: UND,
        withdrawAmount: W,
        sourceToken: POS,
        debtRepaid: W,
      },
      claimableAt: CLAIMABLE_AT,
      settlement: "delayed",
    });

    // Nothing is repaid and nothing leaves yet: the proceeds do not exist.
    expect(result.preview.accountDebt).toBe(DEBT_BEFORE);
    expect(result.calls[0]).toEqual(MOCK_REQUEST_CALL);
  });

  it("holds the payout back when the source is the payout token", async () => {
    const result = await run(
      { type: "WITHDRAW", amount: W, to: WALLET, sourceToken: UND },
      buildSdk({ [UND]: [queued] }),
      [caToken(UND, TVL_BEFORE)],
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("expected ok delayed preview");
    }
    // Only the debt is redeemed: the payout is already in the right token and
    // stays on the account until the tail hands it over.
    expect(result.operations[0]).toMatchObject({
      type: "startDelayedWithdrawal",
      token: UND,
      amountIn: W,
    });
    expect(result.delayed.record).toMatchObject({ debtRepaid: W });
  });

  it("moves the phantom onto the account, and buys it a quota", async () => {
    const state = expectAdjustPreview(
      await run({ type: "WITHDRAW", amount: W, to: WALLET }, buildSdk()),
      {
        totalValue: TVL_BEFORE,
        accountDebt: DEBT_BEFORE,
        expectedOps: withOnchainOpCalls([
          {
            type: "startDelayedWithdrawal",
            token: POS,
            amountIn: 2n * W,
            outputs: [{ token: PHANTOM, amount: 2n * W, isDelayed: true }],
            settlement: "delayed",
          },
          {
            type: "changeQuota",
            quotaIncrease: [{ token: PHANTOM, balance: 18400000000n }],
            quotaDecrease: [{ token: POS, balance: -18400000000n }],
            desiredQuota: {},
          },
        ]),
        expectedCalls: [MOCK_REQUEST_CALL, CA_OP_CALLS.changeQuota],
      },
    );

    expect(assetBalance(state.assets, POS)).toBe(TVL_BEFORE - 2n * W);
    expect(assetBalance(state.assets, PHANTOM)).toBe(2n * W);
  });

  it("still needs a tail when the venue serves only part on the spot", async () => {
    const result = await run(
      { type: "WITHDRAW", amount: W, to: WALLET },
      buildSdk({ [POS]: [halfLiquid] }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("expected ok delayed preview");
    }
    expect(result.delayed.settlement).toBe("delayed");
    expect(assetBalance(result.preview.assets, UND)).toBe(W);
    expect(assetBalance(result.preview.assets, PHANTOM)).toBe(W);
  });

  it("refuses a payout the tail cannot serve", async () => {
    const result = await run(
      { type: "WITHDRAW", amount: W, to: WALLET, tokenOut: POS },
      buildSdk(),
    );
    expectPreviewError(result, "noDelayedRoute");
  });

  it("refuses a source with no redemption venue", async () => {
    const result = await run(
      { type: "WITHDRAW", amount: W, to: WALLET },
      buildSdk({ [ANY]: [queued] }),
    );
    expectPreviewError(result, "noDelayedRoute");
  });

  it("refuses an ambiguous source with several venues", async () => {
    const result = await run(
      { type: "WITHDRAW", amount: W, to: WALLET },
      buildSdk({
        [POS]: [queued, { withdrawalPhantomToken: ANY }],
      }),
    );
    expectPreviewError(result, "multipleDelayedWithdrawals");
  });

  it("refuses to queue a second request for the same asset", async () => {
    const result = await run(
      { type: "WITHDRAW", amount: W, to: WALLET },
      buildSdk(),
      [caToken(POS, TVL_BEFORE, QUOTA_BEFORE), caToken(PHANTOM, W)],
    );
    expectPreviewError(result, "withdrawalInProgress");
  });
});

describe("adjustLeverage.startDelayed — deleveraging only", () => {
  it("redeems the shortfall the idle underlying does not cover", async () => {
    // 2000 TVL on 1000 of debt is 2x; 1.5x wants 500 of debt, so 500 has to be
    // repaid and none of it is sitting in the underlying.
    const result = await run(
      { type: "ADJUST_LEVERAGE", targetLeverage: 150n },
      buildSdk(),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("expected ok delayed preview");
    }
    expect(result.operations[0]).toMatchObject({
      type: "startDelayedWithdrawal",
      token: POS,
      amountIn: DEBT_BEFORE / 2n,
    });
    expect(result.delayed.record).toEqual({ type: "DECREASE_LEVERAGE" });
  });

  it("refuses to raise leverage: borrowing and buying settle at once", async () => {
    const result = await run(
      { type: "ADJUST_LEVERAGE", targetLeverage: 300n },
      buildSdk(),
    );
    expectPreviewError(result, "noDelayedRoute");
  });

  it("refuses when idle underlying already covers the repayment", async () => {
    const result = await run(
      { type: "ADJUST_LEVERAGE", targetLeverage: 150n },
      buildSdk(),
      [
        caToken(POS, TVL_BEFORE / 2n, QUOTA_BEFORE),
        caToken(UND, TVL_BEFORE / 2n),
      ],
    );
    expectPreviewError(result, "noDelayedRoute");
  });
});

describe("withdraw.startDelayed — matrix 4.3 (10U/8U at 5x)", () => {
  // Matrix baseline: 10A of position against 8U of debt; withdrawing 1U of
  // value repays dD = D0 * W / C0 = 4U, so 5A is redeemed in total.
  const M43_BALANCE = 1000000000n;
  const M43_DEBT = 800000000n;
  const M43_W = 100000000n;
  const M43_DD = 400000000n;
  const M43_SPEND = M43_W + M43_DD;
  const quotaOf = (balance: bigint) => (balance * 9200n) / 10000n;

  it("requests payout plus repayment, and records what the tail owes", async () => {
    const sdk = buildSdk();
    const service = new CreditAccountOperationsService(sdk);
    const result = await service.startDelayedIntent({
      intent: { type: "WITHDRAW", amount: M43_W, to: WALLET, sourceToken: POS },
      creditAccount: buildFixtureCreditAccount({
        accountDebt: M43_DEBT,
        tokens: [caToken(POS, M43_BALANCE, quotaOf(M43_BALANCE))],
      }),
      sdk,
      quotaReserve: undefined,
      slippage: undefined,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("expected ok delayed preview");
    }

    expect(result.delayed).toEqual({
      record: {
        type: "WITHDRAW_COLLATERAL",
        to: WALLET,
        withdrawToken: UND,
        withdrawAmount: M43_W,
        sourceToken: POS,
        debtRepaid: M43_DD,
      },
      claimableAt: CLAIMABLE_AT,
      settlement: "delayed",
    });

    // Nothing settled yet: T and D are unchanged, the phantom holds the value.
    expectAdjustPreview(result, {
      totalValue: M43_BALANCE,
      accountDebt: M43_DEBT,
      expectedOps: withOnchainOpCalls([
        {
          type: "startDelayedWithdrawal",
          token: POS,
          amountIn: M43_SPEND,
          outputs: [{ token: PHANTOM, amount: M43_SPEND, isDelayed: true }],
          settlement: "delayed",
        },
        {
          type: "changeQuota",
          quotaIncrease: [{ token: PHANTOM, balance: quotaOf(M43_SPEND) }],
          quotaDecrease: [
            { token: POS, balance: quotaOf(M43_SPEND) - quotaOf(M43_BALANCE) },
          ],
          desiredQuota: {},
        },
      ]),
      expectedCalls: [MOCK_REQUEST_CALL, CA_OP_CALLS.changeQuota],
    });
  });
});
