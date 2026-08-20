import { describe, expect, it } from "vitest";
import { MAX_UINT256, MIN_INT96 } from "../../../constants/math.js";
import type { OnchainSDK } from "../../../index.js";
import { CreditAccountOperationsService } from "../index.js";
import {
  expectAdjustPreview,
  expectPreviewError,
  withOnchainOpCalls,
} from "../testing/expect.js";
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
  MOCK_CLOSE_CALL,
  MOCK_RWA_UNWRAP_CALL,
} from "../testing/sdk-mock.js";
import type { IntentPreviewResult } from "../types.js";
import { DEBT_BEFORE, QUOTA_BEFORE, TVL_BEFORE } from "./withdraw.fixtures.js";

/**
 * `WITHDRAW` for everything — the exit that leaves the account open.
 *
 * Same market as the partial spec: 2000 UND of TVL against 1000 of debt, so
 * 1000 of net value is what the wallet is owed. Asking for all of it turns the
 * flow inside out — there is no leverage left to preserve, so the quotas go
 * first, the position is sold whole in one many-to-one route, the loan is
 * settled out of the proceeds and what remains is handed over.
 *
 * `MAX_UINT256` is how a form says "everything", and the net value says the
 * same thing in figures; both are tested, since a caller reading the net value
 * off a stale block must land in the same place.
 */

/** The whole net value, priced in the underlying. */
const ALL = TVL_BEFORE - DEBT_BEFORE;

function run(
  tokens: ReturnType<typeof caToken>[],
  opts?: { sdk?: OnchainSDK; amount?: bigint },
): Promise<IntentPreviewResult> {
  const sdk = opts?.sdk ?? buildMarketSdk();
  return new CreditAccountOperationsService(sdk).startIntent({
    intent: {
      type: "WITHDRAW",
      amount: opts?.amount ?? MAX_UINT256,
      to: WALLET,
    },
    creditAccount: buildFixtureCreditAccount({
      accountDebt: DEBT_BEFORE,
      tokens,
    }),
    sdk,
    quotaReserve: undefined,
    slippage: undefined,
  });
}

describe("withdraw.start — everything out, account left open", () => {
  it("idle underlying covers the debt, so nothing is routed", async () => {
    const state = expectAdjustPreview(await run([caToken(UND, TVL_BEFORE)]), {
      totalValue: 0n,
      accountDebt: 0n,
      expectedOps: withOnchainOpCalls([
        { type: "decreaseDebt", amount: DEBT_BEFORE },
        { type: "withdrawCollateral", token: UND, amount: ALL, to: WALLET },
      ]),
      expectedCalls: [CA_OP_CALLS.decreaseDebt, CA_OP_CALLS.withdrawCollateral],
    });

    expect(state.assets).toEqual([]);
  });

  it("sells the position whole, settles the loan, hands the rest over", async () => {
    const state = expectAdjustPreview(
      await run([caToken(POS, TVL_BEFORE, QUOTA_BEFORE)]),
      {
        totalValue: 0n,
        accountDebt: 0n,
        expectedOps: withOnchainOpCalls([
          // the quotas go first: past the repayment they would charge a loan
          // that no longer exists
          {
            type: "changeQuota",
            quotaIncrease: [],
            quotaDecrease: [{ token: POS, balance: MIN_INT96 }],
            desiredQuota: {},
          },
          // one route for the whole position, not one leg per token
          {
            type: "swap",
            from: [{ token: POS, balance: TVL_BEFORE }],
            tokenOut: UND,
            amountOut: TVL_BEFORE,
            calls: [MOCK_CLOSE_CALL],
          },
          { type: "decreaseDebt", amount: DEBT_BEFORE },
          { type: "withdrawCollateral", token: UND, amount: ALL, to: WALLET },
        ]),
        expectedCalls: [
          CA_OP_CALLS.changeQuota,
          MOCK_CLOSE_CALL,
          CA_OP_CALLS.decreaseDebt,
          CA_OP_CALLS.withdrawCollateral,
        ],
      },
    );

    expect(state.assets).toEqual([]);
    expect(state.quotas).toEqual({});
  });

  it("gives the router every token at once, and pays out in one", async () => {
    const result = await run([
      caToken(POS, TVL_BEFORE, QUOTA_BEFORE),
      caToken(POS2, 5000000000n, 0n),
    ]);
    if (!result.ok) throw new Error(`expected a preview, got ${result.reason}`);

    const swap = result.operations.find(op => op.type === "swap");
    expect(swap?.from).toEqual([
      { token: POS, balance: TVL_BEFORE },
      { token: POS2, balance: 5000000000n },
    ]);
    // everything came back as underlying, so one withdrawal empties the account
    expect(
      result.operations
        .filter(op => op.type === "withdrawCollateral")
        .map(op => op.token),
    ).toEqual([UND]);
    expect(result.preview.assets).toEqual([]);
  });

  it("settles the loan in full, so accrued interest cannot leave dust", async () => {
    const result = await run([caToken(UND, TVL_BEFORE)]);
    if (!result.ok) throw new Error(`expected a preview, got ${result.reason}`);

    expect(
      result.operations.find(op => op.type === "decreaseDebt"),
    ).toMatchObject({ amount: DEBT_BEFORE, full: true });
  });

  it("hands over the balance the facade finds, not the one quoted here", async () => {
    const result = await run([caToken(POS, TVL_BEFORE, QUOTA_BEFORE)]);
    if (!result.ok) throw new Error(`expected a preview, got ${result.reason}`);

    // A route that beats its floor leaves more underlying than the projection
    // knows about, and the exit is meant to leave nothing behind.
    expect(
      result.operations.find(op => op.type === "withdrawCollateral"),
    ).toMatchObject({ amount: ALL, all: true });
  });

  it("drops every quota the account holds, whatever it holds", async () => {
    const result = await run([
      caToken(POS, TVL_BEFORE, QUOTA_BEFORE),
      caToken(POS2, 5000000000n, 4000000000n),
    ]);
    if (!result.ok) throw new Error(`expected a preview, got ${result.reason}`);

    expect(
      result.operations.find(op => op.type === "changeQuota"),
    ).toMatchObject({
      quotaIncrease: [],
      quotaDecrease: [
        { token: POS, balance: MIN_INT96 },
        { token: POS2, balance: MIN_INT96 },
      ],
    });
    // nothing is left quoted, whatever it was quoted at before
    expect(result.preview.quotas).toEqual({});
  });

  it("RWA market: the wrapper is unwrapped before anything leaves", async () => {
    const sdk = buildMarketSdk({ rwaAssets: { [UND]: RWA_ASSET } });
    expectAdjustPreview(await run([caToken(UND, TVL_BEFORE)], { sdk }), {
      totalValue: 0n,
      accountDebt: 0n,
      expectedOps: withOnchainOpCalls([
        { type: "decreaseDebt", amount: DEBT_BEFORE },
        {
          type: "unwrapRwaCollateral",
          tokenIn: UND,
          amount: ALL,
          tokenOut: RWA_ASSET,
          amountOut: ALL,
        },
        {
          type: "withdrawCollateral",
          token: RWA_ASSET,
          amount: ALL,
          to: WALLET,
        },
      ]),
      expectedCalls: [
        CA_OP_CALLS.decreaseDebt,
        MOCK_RWA_UNWRAP_CALL,
        CA_OP_CALLS.withdrawCollateral,
      ],
    });
  });

  it("asking for the net value exactly is the same exit", async () => {
    const state = expectAdjustPreview(
      await run([caToken(UND, TVL_BEFORE)], { amount: ALL }),
      {
        totalValue: 0n,
        accountDebt: 0n,
        expectedOps: withOnchainOpCalls([
          { type: "decreaseDebt", amount: DEBT_BEFORE },
          { type: "withdrawCollateral", token: UND, amount: ALL, to: WALLET },
        ]),
        expectedCalls: [
          CA_OP_CALLS.decreaseDebt,
          CA_OP_CALLS.withdrawCollateral,
        ],
      },
    );

    expect(state.assets).toEqual([]);
  });

  it("asking for more than the net value takes the net value, not more", async () => {
    const state = expectAdjustPreview(
      await run([caToken(UND, TVL_BEFORE)], { amount: ALL * 10n }),
      {
        totalValue: 0n,
        accountDebt: 0n,
        expectedOps: withOnchainOpCalls([
          { type: "decreaseDebt", amount: DEBT_BEFORE },
          { type: "withdrawCollateral", token: UND, amount: ALL, to: WALLET },
        ]),
        expectedCalls: [
          CA_OP_CALLS.decreaseDebt,
          CA_OP_CALLS.withdrawCollateral,
        ],
      },
    );

    expect(state.assets).toEqual([]);
  });

  it("refuses an account the debt has already caught up with", async () => {
    // The position is worth less than the loan: selling all of it would still
    // leave the facade unpaid.
    expectPreviewError(
      await run([caToken(POS, DEBT_BEFORE / 2n, QUOTA_BEFORE)]),
      "insufficientSourceBalance",
    );
  });

  it("refuses while a redemption is still in flight", async () => {
    // POS2 stands for a pending withdrawal here: it can neither be sold nor
    // handed over, so there is no way to empty the account yet.
    const sdk = buildMarketSdk({ phantoms: [POS2] });
    expectPreviewError(
      await run(
        [
          caToken(POS, TVL_BEFORE, QUOTA_BEFORE),
          caToken(POS2, 5000000000n, 0n),
        ],
        { sdk },
      ),
      "withdrawalInProgress",
    );
  });

  it("cannot be started as a redemption: the tail has no payout to record", async () => {
    const sdk = buildMarketSdk({
      delayed: { [POS]: [{ withdrawalPhantomToken: POS2 }] },
    });
    const result = await new CreditAccountOperationsService(
      sdk,
    ).startDelayedIntent({
      intent: {
        type: "WITHDRAW",
        amount: MAX_UINT256,
        to: WALLET,
        sourceToken: POS,
      },
      creditAccount: buildFixtureCreditAccount({
        accountDebt: DEBT_BEFORE,
        tokens: [caToken(POS, TVL_BEFORE, QUOTA_BEFORE)],
      }),
      sdk,
      quotaReserve: undefined,
      slippage: undefined,
    });

    expectPreviewError(result, "noDelayedRoute");
  });
});
