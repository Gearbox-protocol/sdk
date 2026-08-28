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
 * the in-flight position keeps its value while it is in flight.
 *
 * Two states are checked throughout, because the request is half an operation:
 * `delayed.afterRequest` is what the transaction on offer lands in — the source
 * spent, the phantom in its place, nothing repaid — and `state` is where the
 * intent ends, once the redemption has been claimed and the tail has run. The
 * instant specs land in the latter in one go, so the two agree by design.
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
      totalDebt: DEBT_BEFORE,
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
    expect(result.delayed).toMatchObject({
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
      // What the venue will pay for the redeemed source, 1:1 here.
      claim: { token: UND, amount: 2n * W },
    });

    // The transaction itself repays nothing and hands nothing over: the
    // proceeds do not exist yet.
    expect(result.delayed.afterRequest.totalDebt.value).toBe(DEBT_BEFORE);
    expect(result.delayed.afterRequest.totalValue.value).toBe(TVL_BEFORE);
    // Where the intent ends, though, is with the payout made and the debt down
    // by the dD the tail repays out of the claim.
    expect(result.state.totalDebt.value).toBe(DEBT_BEFORE - W);
    expect(result.state.totalValue.value).toBe(TVL_BEFORE - 2n * W);
    expect(result.calls[0]).toEqual(MOCK_REQUEST_CALL);
  });

  it("reports no price impact: a request routes nothing and its tail is oracle-priced", async () => {
    const result = await run(
      { type: "WITHDRAW", amount: W, to: WALLET },
      buildSdk(),
    );
    if (!result.ok) {
      throw new Error("expected ok delayed preview");
    }

    // `undefined`, not zero. The oracle quoter this walk uses has no depth to
    // discover, and a zero here would read as a measurement that was taken.
    expect(result.state.priceImpact).toBeUndefined();
    expect(result.delayed.afterRequest.priceImpact).toBeUndefined();
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
    const result = await run(
      { type: "WITHDRAW", amount: W, to: WALLET },
      buildSdk(),
    );
    expectAdjustPreview(result, {
      totalValue: TVL_BEFORE - 2n * W,
      totalDebt: DEBT_BEFORE - W,
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
    });
    if (!result.ok) {
      throw new Error("expected ok delayed preview");
    }

    // Between the two transactions the redeemed value sits in the phantom.
    const { assets } = result.delayed.afterRequest;
    expect(assetBalance(assets, POS)).toBe(TVL_BEFORE - 2n * W);
    expect(assetBalance(assets, PHANTOM)).toBe(2n * W);
    // And once the claim lands, neither is left: what it brought paid the
    // wallet and the loan.
    expect(assetBalance(result.state.assets, PHANTOM)).toBe(0n);
    expect(assetBalance(result.state.assets, POS)).toBe(TVL_BEFORE - 2n * W);
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
    // Half the redemption lands at once, half waits on the phantom.
    const { assets } = result.delayed.afterRequest;
    expect(assetBalance(assets, UND)).toBe(W);
    expect(assetBalance(assets, PHANTOM)).toBe(W);
    // The tail spends both: W to the wallet, W into the debt.
    expect(result.state.totalDebt.value).toBe(DEBT_BEFORE - W);
    expect(assetBalance(result.state.assets, PHANTOM)).toBe(0n);
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
        totalDebt: M43_DEBT,
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

    expect(result.delayed).toMatchObject({
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
      claim: { token: UND, amount: M43_SPEND },
    });

    // Nothing settled by the transaction: T and D are unchanged and the
    // phantom holds the value in flight.
    expect(result.delayed.afterRequest.totalValue.value).toBe(M43_BALANCE);
    expect(result.delayed.afterRequest.totalDebt.value).toBe(M43_DEBT);
    // The matrix's end state: 1U of value paid out and 4U of debt repaid.
    expectAdjustPreview(result, {
      totalValue: M43_BALANCE - M43_SPEND,
      totalDebt: M43_DEBT - M43_DD,
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

/** Each refusal carries the numbers a form would otherwise re-derive. */
describe("withdraw.startDelayed — what each refusal names", () => {
  it("a payout the tail cannot serve names the token asked for", async () => {
    const result = await run(
      { type: "WITHDRAW", amount: W, to: WALLET, tokenOut: POS },
      buildSdk(),
    );

    if (result.ok || result.reason !== "noDelayedRoute") {
      throw new Error("expected noDelayedRoute");
    }
    expect(result.detail).toEqual({
      token: expect.objectContaining({ address: POS }),
    });
  });

  it("an ambiguous redemption names the source and how many venues", async () => {
    const result = await run(
      { type: "WITHDRAW", amount: W, to: WALLET },
      buildSdk({ [POS]: [queued, { withdrawalPhantomToken: UND }] }),
    );

    if (result.ok || result.reason !== "multipleDelayedWithdrawals") {
      throw new Error("expected multipleDelayedWithdrawals");
    }
    expect(result.detail).toEqual({
      token: expect.objectContaining({ address: POS }),
      venues: 2,
    });
  });

  it("a redemption in flight names the phantom holding it", async () => {
    const result = await run(
      { type: "WITHDRAW", amount: W, to: WALLET },
      buildSdk(),
      [caToken(POS, TVL_BEFORE, QUOTA_BEFORE), caToken(PHANTOM, W)],
    );

    if (result.ok || result.reason !== "withdrawalInProgress") {
      throw new Error("expected withdrawalInProgress");
    }
    expect(result.detail).toEqual({
      inFlight: {
        token: expect.objectContaining({ address: PHANTOM }),
        value: W,
        valueUsd: null,
      },
    });
  });
});
