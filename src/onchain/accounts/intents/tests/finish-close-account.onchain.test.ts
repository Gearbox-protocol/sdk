import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import { MIN_INT96 } from "../../../constants/math.js";
import type { ClaimableWithdrawal, OnchainSDK } from "../../../index.js";
import { CreditAccountOperationsService } from "../index.js";
import { expectAdjustPreview, withOnchainOpCalls } from "../testing/expect.js";
import {
  buildFixtureCreditAccount,
  buildMarketSdk,
  caToken,
  POS,
  POS2,
  RWA_ASSET,
  UND,
  WALLET,
} from "../testing/market.js";
import {
  CA_OP_CALLS,
  MOCK_CLAIM_CALL,
  MOCK_CLOSE_CALL,
  MOCK_RWA_UNWRAP_CALL,
  MOCK_RWA_WRAP_CALL,
} from "../testing/sdk-mock.js";
import type { IntentPreviewResult } from "../types.js";
import { DEBT_BEFORE, QUOTA_BEFORE, TVL_BEFORE } from "./withdraw.fixtures.js";

/**
 * The tail of an exit — `CLOSE_ACCOUNT`, the intent a delayed full withdrawal
 * records.
 *
 * The leading half redeemed the position and could name nothing else: how much
 * the redemption would pay, what the debt would have grown to and what else
 * would be on the account by then are all unknowable days in advance. So this
 * half is the instant exit over again, run against the account the claim finds:
 * the quotas go, everything is sold in one route, the loan is settled out of
 * the proceeds and the remainder is handed over.
 *
 * `POS2` plays the withdrawal phantom, 1:1 with `POS` and quotable, so the
 * quota the request bought it is there to be dropped.
 */

const PHANTOM = POS2;
/** The position the request redeemed, and what the claim pays for it. */
const REDEEMED = 150000000000n;
/** The part of the position the request left behind, to be sold by the tail. */
const KEPT = TVL_BEFORE - REDEEMED;

/**
 * The exit tail against an account holding `redeemed` in the phantom — all of
 * which the claim burns — plus whatever else the request left behind.
 */
function run(args: {
  redeemed: bigint;
  claimedToken: Address;
  claimedAmount: bigint;
  rest?: ReturnType<typeof caToken>[];
  totalDebt?: bigint;
  sdk?: OnchainSDK;
}): Promise<IntentPreviewResult> {
  const sdk = args.sdk ?? buildMarketSdk();
  return new CreditAccountOperationsService(sdk).finishIntent({
    intent: { type: "CLOSE_ACCOUNT", to: WALLET },
    claimable: {
      token: POS,
      withdrawalPhantomToken: PHANTOM,
      withdrawalTokenSpent: args.redeemed,
      outputs: [
        {
          token: args.claimedToken,
          amount: args.claimedAmount,
          isDelayed: false,
        },
      ],
      claimCalls: [MOCK_CLAIM_CALL],
    } as ClaimableWithdrawal,
    creditAccount: buildFixtureCreditAccount({
      totalDebt: args.totalDebt ?? DEBT_BEFORE,
      tokens: [
        caToken(PHANTOM, args.redeemed, QUOTA_BEFORE),
        ...(args.rest ?? []),
      ],
    }),
    sdk,
    quotaReserve: undefined,
    slippage: undefined,
  });
}

describe("finish.closeAccount — the claim lands, the account empties", () => {
  it("sells what the request left, settles the loan, hands the rest over", async () => {
    const state = expectAdjustPreview(
      await run({
        redeemed: REDEEMED,
        claimedToken: UND,
        claimedAmount: REDEEMED,
        rest: [caToken(POS, KEPT, QUOTA_BEFORE)],
      }),
      {
        totalValue: 0n,
        totalDebt: 0n,
        expectedOps: withOnchainOpCalls([
          {
            type: "claimDelayedWithdrawal",
            token: POS,
            withdrawalPhantomToken: PHANTOM,
            withdrawalTokenSpent: REDEEMED,
            outputs: [{ token: UND, amount: REDEEMED, isDelayed: false }],
          },
          // the quotas go before the repayment, as in the instant exit
          {
            type: "changeQuota",
            quotaIncrease: [],
            quotaDecrease: [
              { token: PHANTOM, balance: MIN_INT96 },
              { token: POS, balance: MIN_INT96 },
            ],
            desiredQuota: {},
          },
          // one route for whatever the claim did not bring in the underlying
          {
            type: "swap",
            from: [{ token: POS, balance: KEPT }],
            tokenOut: UND,
            amountOut: KEPT,
            calls: [MOCK_CLOSE_CALL],
          },
          { type: "decreaseDebt", amount: DEBT_BEFORE },
          {
            type: "withdrawCollateral",
            token: UND,
            amount: TVL_BEFORE - DEBT_BEFORE,
            to: WALLET,
          },
        ]),
        expectedCalls: [
          MOCK_CLAIM_CALL,
          CA_OP_CALLS.changeQuota,
          MOCK_CLOSE_CALL,
          CA_OP_CALLS.decreaseDebt,
          CA_OP_CALLS.withdrawCollateral,
        ],
      },
    );

    expect(state.assets).toEqual([]);
    expect(state.quotas).toEqual([]);
  });

  it("nothing left to route: the claim alone settles and pays out", async () => {
    const result = await run({
      redeemed: TVL_BEFORE,
      claimedToken: UND,
      claimedAmount: TVL_BEFORE,
    });
    if (!result.ok) throw new Error(`expected a preview, got ${result.reason}`);

    expect(result.operations.map(op => op.type)).toEqual([
      "claimDelayedWithdrawal",
      "changeQuota",
      "decreaseDebt",
      "withdrawCollateral",
    ]);
    expect(result.preview.assets).toEqual([]);
  });

  it("an account that owes nothing skips the repayment", async () => {
    const result = await run({
      redeemed: TVL_BEFORE,
      claimedToken: UND,
      claimedAmount: TVL_BEFORE,
      totalDebt: 0n,
    });
    if (!result.ok) throw new Error(`expected a preview, got ${result.reason}`);

    expect(result.operations.map(op => op.type)).not.toContain("decreaseDebt");
    expect(
      result.operations.find(op => op.type === "withdrawCollateral"),
    ).toMatchObject({ token: UND, amount: TVL_BEFORE, all: true });
  });

  it("RWA market: the claim is wrapped in, the remainder unwrapped out", async () => {
    // A Securitize redemption pays the raw asset, which the loan is not
    // denominated in — so it is wrapped before the debt sees it, and what
    // survives the repayment is unwrapped again on its way to the wallet.
    const sdk = buildMarketSdk({ rwaAssets: { [UND]: RWA_ASSET } });
    const state = expectAdjustPreview(
      await run({
        redeemed: TVL_BEFORE,
        claimedToken: RWA_ASSET,
        claimedAmount: TVL_BEFORE,
        sdk,
      }),
      {
        totalValue: 0n,
        totalDebt: 0n,
        expectedOps: withOnchainOpCalls([
          {
            type: "claimDelayedWithdrawal",
            token: POS,
            withdrawalPhantomToken: PHANTOM,
            withdrawalTokenSpent: TVL_BEFORE,
            outputs: [
              { token: RWA_ASSET, amount: TVL_BEFORE, isDelayed: false },
            ],
          },
          {
            type: "wrapRwaCollateral",
            tokenIn: RWA_ASSET,
            amount: TVL_BEFORE,
            tokenOut: UND,
            amountOut: TVL_BEFORE,
          },
          {
            type: "changeQuota",
            quotaIncrease: [],
            quotaDecrease: [{ token: PHANTOM, balance: MIN_INT96 }],
            desiredQuota: {},
          },
          { type: "decreaseDebt", amount: DEBT_BEFORE },
          {
            type: "unwrapRwaCollateral",
            tokenIn: UND,
            amount: TVL_BEFORE - DEBT_BEFORE,
            tokenOut: RWA_ASSET,
            amountOut: TVL_BEFORE - DEBT_BEFORE,
          },
          {
            type: "withdrawCollateral",
            token: RWA_ASSET,
            amount: TVL_BEFORE - DEBT_BEFORE,
            to: WALLET,
          },
        ]),
        expectedCalls: [
          MOCK_CLAIM_CALL,
          MOCK_RWA_WRAP_CALL,
          CA_OP_CALLS.changeQuota,
          CA_OP_CALLS.decreaseDebt,
          MOCK_RWA_UNWRAP_CALL,
          CA_OP_CALLS.withdrawCollateral,
        ],
      },
    );

    expect(state.assets).toEqual([]);
  });
});
