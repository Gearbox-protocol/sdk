import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type { DelayedIntent } from "../../../../model/index.js";
import type { ClaimableWithdrawal, OnchainSDK } from "../../../index.js";
import { CreditAccountOperationsService } from "../index.js";
import { assetBalance } from "../testing/expect.js";
import {
  buildFixtureCreditAccount,
  buildMarketSdk,
  caToken,
  POS,
  POS2,
  UND,
  WALLET,
} from "../testing/market.js";
import { MOCK_CLAIM_CALL } from "../testing/sdk-mock.js";
import type { ClaimRemainder, FinishIntentResult } from "../types.js";

/**
 * Tails of a claim that brought only part of what the request queued.
 *
 * Every redemption venue the engine was written for answers whole: one request,
 * one claim, one tail. A legacy Mellow multivault does not — it pays out what
 * its subvaults hold liquid and re-queues the rest — so the claim credits an
 * instant output *and* a delayed one, and the operation is not over when the
 * tail has run.
 *
 * The baseline is the matrix 4.3 account: 5U of position against 8U of debt,
 * a withdrawal of W = 1U at fixed leverage that deferred dD = 4U of repayment,
 * and 5U redeemed for both. `POS2` plays the withdrawal phantom, 1:1 with the
 * underlying in both price and decimals, so a half that matured reads as half.
 */

const PHANTOM = POS2;
/** What the request redeemed: the payout plus the repayment it deferred. */
const SPEND = 500_000_000n;
/** Payout promised to the wallet, 1U. */
const W = 100_000_000n;
/** Repayment the leading half deferred, 4U. */
const DD = 400_000_000n;
const DEBT = 800_000_000n;

const WITHDRAW: DelayedIntent = {
  type: "WITHDRAW_COLLATERAL",
  to: WALLET,
  sourceToken: POS,
  withdrawToken: UND,
  withdrawAmount: W,
  debtRepaid: DD,
};

/**
 * A claim of `matured`, leaving `queued` of the phantom behind. The whole
 * phantom balance is burned and a fresh one minted for the remainder, which is
 * how a venue that pays in instalments reports one.
 */
function claim(args: {
  spent: bigint;
  matured: bigint;
  queued: bigint;
}): ClaimableWithdrawal {
  return {
    token: POS,
    withdrawalPhantomToken: PHANTOM,
    withdrawalTokenSpent: args.spent,
    outputs: [
      ...(args.matured > 0n
        ? [{ token: UND, amount: args.matured, isDelayed: false }]
        : []),
      ...(args.queued > 0n
        ? [{ token: PHANTOM, amount: args.queued, isDelayed: true }]
        : []),
    ],
    claimCalls: [MOCK_CLAIM_CALL],
  } as ClaimableWithdrawal;
}

function run(args: {
  intent: DelayedIntent;
  claimable: ClaimableWithdrawal;
  debt: bigint;
  position: bigint;
  phantom: bigint;
  sdk?: OnchainSDK;
}): Promise<FinishIntentResult> {
  const sdk = args.sdk ?? buildMarketSdk();
  const service = new CreditAccountOperationsService(sdk);
  return service.finishIntent({
    intent: args.intent,
    claimable: args.claimable,
    creditAccount: buildFixtureCreditAccount({
      totalDebt: args.debt,
      tokens: [
        caToken(POS, args.position, args.position),
        caToken(PHANTOM, args.phantom, args.phantom),
      ],
    }),
    sdk,
    quotaReserve: undefined,
    slippage: undefined,
  });
}

function ok(result: FinishIntentResult) {
  if (!result.ok) {
    throw new Error(`expected a tail, got ${result.reason}`);
  }
  return result;
}

function paidOut(result: ReturnType<typeof ok>, token: Address): bigint {
  let sum = 0n;
  for (const op of result.operations) {
    if (op.type === "withdrawCollateral" && op.token === token) {
      sum += op.amount;
    }
  }
  return sum;
}

function stillOwed(remainder: ClaimRemainder | undefined) {
  if (remainder?.intent.type !== "WITHDRAW_COLLATERAL") {
    throw new Error("expected a withdrawal to finish");
  }
  return remainder.intent;
}

describe("withdraw tail — a claim that matured in part", () => {
  it("serves the share that arrived and hands the rest to the next claim", async () => {
    const result = ok(
      await run({
        intent: WITHDRAW,
        claimable: claim({
          spent: SPEND,
          matured: SPEND / 2n,
          queued: SPEND / 2n,
        }),
        debt: DEBT,
        position: SPEND,
        phantom: SPEND,
      }),
    );

    // Half of the redemption is here, so half of the payout and half of the
    // repayment are made — the withdrawal keeps the leverage it was asked to
    // keep, instead of paying the wallet in full now and deleveraging later.
    expect(paidOut(result, UND)).toBe(W / 2n);
    expect(result.state.totalDebt.value).toBe(DEBT - DD / 2n);
    // And the other half is still in flight, in the phantom the claim minted.
    expect(assetBalance(result.state.assets, PHANTOM)).toBe(SPEND / 2n);
    expect(result.remainder?.inFlight).toMatchObject({
      token: expect.objectContaining({ address: PHANTOM }),
      value: SPEND / 2n,
    });
    expect(stillOwed(result.remainder)).toMatchObject({
      withdrawAmount: W / 2n,
      debtRepaid: DD / 2n,
    });
  });

  it("pays the wallet and the loan once between the two claims", async () => {
    const first = ok(
      await run({
        intent: WITHDRAW,
        claimable: claim({
          spent: SPEND,
          matured: SPEND / 2n,
          queued: SPEND / 2n,
        }),
        debt: DEBT,
        position: SPEND,
        phantom: SPEND,
      }),
    );

    // The rest matures and is claimed whole, resumed with what the first tail
    // left owing rather than with the intent the request recorded.
    const second = ok(
      await run({
        intent: stillOwed(first.remainder),
        claimable: claim({
          spent: SPEND / 2n,
          matured: SPEND / 2n,
          queued: 0n,
        }),
        debt: first.state.totalDebt.value,
        position: SPEND,
        phantom: SPEND / 2n,
      }),
    );

    expect(paidOut(first, UND) + paidOut(second, UND)).toBe(W);
    expect(second.state.totalDebt.value).toBe(DEBT - DD);
    expect(assetBalance(second.state.assets, PHANTOM)).toBe(0n);
    expect(second.remainder).toBeUndefined();
  });

  it("claims and nothing else when the venue moved the queue and paid nothing", async () => {
    const result = ok(
      await run({
        intent: WITHDRAW,
        claimable: claim({ spent: SPEND, matured: 0n, queued: SPEND }),
        debt: DEBT,
        position: SPEND,
        phantom: SPEND,
      }),
    );

    // Nothing landed, so there is nothing to spend: the claim is worth sending
    // on its own — it is what moves the queue — and the intent is untouched.
    expect(result.operations.map(op => op.type)).toEqual([
      "claimDelayedWithdrawal",
    ]);
    expect(result.state.totalDebt.value).toBe(DEBT);
    expect(stillOwed(result.remainder)).toMatchObject({
      withdrawAmount: W,
      debtRepaid: DD,
    });
  });

  it("reports no remainder when the claim brought the whole redemption", async () => {
    const result = ok(
      await run({
        intent: WITHDRAW,
        claimable: claim({ spent: SPEND, matured: SPEND, queued: 0n }),
        debt: DEBT,
        position: SPEND,
        phantom: SPEND,
      }),
    );

    expect(result.remainder).toBeUndefined();
    expect(paidOut(result, UND)).toBe(W);
    expect(result.state.totalDebt.value).toBe(DEBT - DD);
  });
});

describe("exit tail — a claim that matured in part", () => {
  const EXIT: DelayedIntent = { type: "CLOSE_ACCOUNT", to: WALLET };

  it("deleverages instead of selling an account a withdrawal is still in flight on", async () => {
    const result = ok(
      await run({
        intent: EXIT,
        claimable: claim({
          spent: SPEND,
          matured: SPEND / 2n,
          queued: SPEND / 2n,
        }),
        debt: DEBT,
        position: SPEND,
        phantom: SPEND,
      }),
    );

    // The phantom can be neither sold nor swept, so the exit cannot run yet:
    // what arrived goes into the debt and the account is emptied by the claim
    // that brings the last of it. Nothing is sold and nothing is swept — the
    // trailing quota update is the phantom's own, which the claim shrank.
    expect(result.operations.map(op => op.type)).toEqual([
      "claimDelayedWithdrawal",
      "decreaseDebt",
      "changeQuota",
    ]);
    expect(result.state.totalDebt.value).toBe(DEBT - SPEND / 2n);
    expect(result.remainder?.intent).toEqual(EXIT);
  });

  it("sells the account whole once the last of it has matured", async () => {
    const result = ok(
      await run({
        intent: EXIT,
        claimable: claim({
          spent: SPEND / 2n,
          matured: SPEND / 2n,
          queued: 0n,
        }),
        debt: DEBT - SPEND / 2n,
        position: SPEND,
        phantom: SPEND / 2n,
      }),
    );

    expect(result.operations.map(op => op.type)).toContain("swap");
    expect(result.remainder).toBeUndefined();
  });
});
