import { describe, expect, it } from "vitest";
import { MAX_UINT256, MIN_INT96 } from "../../../constants/math.js";
import type { OnchainSDK } from "../../../index.js";
import { CreditAccountOperationsService } from "../index.js";
import {
  assetBalance,
  expectAdjustPreview,
  expectPreviewError,
  withOnchainOpCalls,
} from "../testing/expect.js";
import {
  buildFixtureCreditAccount,
  buildMarketSdk,
  caToken,
  POS,
  RWA_ASSET,
  UND,
} from "../testing/market.js";
import { CA_OP_CALLS, MOCK_RWA_WRAP_CALL } from "../testing/sdk-mock.js";
import type { IntentPreviewResult, RepayStrategyIntent } from "../types.js";

/**
 * `REPAY` — funding from the wallet goes straight into the debt.
 *
 * The market is the one the other specs use: 2000 UND of position against 1000
 * of debt, `POS` 1:1 with `UND`. Nothing here is routed and nothing leaves the
 * account, so what the cases pin down is how much debt a payment settles, what
 * happens to the part that exceeds it, and that a payment which clears the
 * loan takes the quotas with it — in that order, since a quota outliving its
 * debt keeps charging.
 */

/** 2000 UND of position, held in the 1:1 token. */
const HELD_POS = 200000000000n;
/** 1000 UND of debt. */
const DEBT = 100000000000n;
/** LT-weighted quota bought for the position, 92% of its value. */
const QUOTA_POS = 184000000000n;

/** 400 UND, a payment the loan survives. */
const PART = 40000000000n;
/** 200 UND on top of the debt, the buffer a "repay everything" caller adds. */
const BUFFER = 20000000000n;
/** The buffer `MAX_UINT256` adds by itself: 10bps of the debt. */
const MARGIN = DEBT / 1000n;

function run(
  intent: RepayStrategyIntent,
  opts?: { sdk?: OnchainSDK; totalDebt?: bigint },
): Promise<IntentPreviewResult> {
  const sdk = opts?.sdk ?? buildMarketSdk();
  return new CreditAccountOperationsService(sdk).startIntent({
    intent,
    creditAccount: buildFixtureCreditAccount({
      totalDebt: opts?.totalDebt ?? DEBT,
      tokens: [caToken(POS, HELD_POS, QUOTA_POS)],
    }),
    sdk,
    quotaReserve: undefined,
    slippage: undefined,
  });
}

const repay = (token: string, amount: bigint): RepayStrategyIntent => ({
  type: "REPAY",
  token: token as `0x${string}`,
  amount,
});

function expectOk(
  result: IntentPreviewResult,
): Extract<IntentPreviewResult, { ok: true }> {
  if (!result.ok) {
    throw new Error(`expected a preview, got ${result.reason}`);
  }
  return result;
}

describe("repay.start — debt down, position untouched", () => {
  it("part of the debt: collateral in, debt out, nothing else moves", async () => {
    const result = await run(repay(UND, PART));
    const state = expectAdjustPreview(result, {
      // The payment lands and leaves again, so TVL is the position alone; what
      // grew is the share of it the wallet owns.
      totalValue: HELD_POS,
      totalDebt: DEBT - PART,
      expectedOps: withOnchainOpCalls([
        { type: "addCollateral", token: UND, amount: PART, value: undefined },
        { type: "decreaseDebt", amount: PART },
      ]),
      expectedCalls: [CA_OP_CALLS.addCollateral, CA_OP_CALLS.decreaseDebt],
    });

    // The position keeps the quota it had: it still backs a loan.
    expect(state.quotas).toMatchObject([
      { token: { address: POS }, value: QUOTA_POS },
    ]);
    expect(assetBalance(state.assets, UND)).toBe(0n);
  });

  it("the whole debt: quotas go first, then the loan is settled in full", async () => {
    const result = await run(repay(UND, DEBT));
    const state = expectAdjustPreview(result, {
      totalValue: HELD_POS,
      totalDebt: 0n,
      expectedOps: withOnchainOpCalls([
        { type: "addCollateral", token: UND, amount: DEBT, value: undefined },
        {
          type: "changeQuota",
          quotaIncrease: [],
          quotaDecrease: [{ token: POS, balance: MIN_INT96 }],
          desiredQuota: {},
        },
        { type: "decreaseDebt", amount: DEBT },
      ]),
      expectedCalls: [
        CA_OP_CALLS.addCollateral,
        CA_OP_CALLS.changeQuota,
        CA_OP_CALLS.decreaseDebt,
      ],
    });

    // nothing is quoted once the loan is gone
    expect(state.quotas).toEqual([]);
  });

  it("asks the facade for all of it, so accrued interest cannot leave dust", async () => {
    const { operations } = expectOk(await run(repay(UND, DEBT)));
    const settled = operations.find(op => op.type === "decreaseDebt");

    expect(settled).toMatchObject({ amount: DEBT, full: true });
  });

  it("names the amount when the loan survives, since there is a tail to keep", async () => {
    const { operations } = expectOk(await run(repay(UND, PART)));
    const settled = operations.find(op => op.type === "decreaseDebt");

    expect(settled?.type === "decreaseDebt" && settled.full).toBeUndefined();
  });

  it("more than the debt: the excess stays on the account as collateral", async () => {
    const result = await run(repay(UND, DEBT + BUFFER));
    const state = expectAdjustPreview(result, {
      totalValue: HELD_POS + BUFFER,
      totalDebt: 0n,
      expectedOps: withOnchainOpCalls([
        {
          type: "addCollateral",
          token: UND,
          amount: DEBT + BUFFER,
          value: undefined,
        },
        {
          type: "changeQuota",
          quotaIncrease: [],
          quotaDecrease: [{ token: POS, balance: MIN_INT96 }],
          desiredQuota: {},
        },
        { type: "decreaseDebt", amount: DEBT },
      ]),
      expectedCalls: [
        CA_OP_CALLS.addCollateral,
        CA_OP_CALLS.changeQuota,
        CA_OP_CALLS.decreaseDebt,
      ],
    });

    expect(assetBalance(state.assets, UND)).toBe(BUFFER);
  });

  it("MAX_UINT256: the wallet is charged the debt plus its interest margin", async () => {
    const result = await run(repay(UND, MAX_UINT256));
    const state = expectAdjustPreview(result, {
      totalValue: HELD_POS + MARGIN,
      totalDebt: 0n,
      expectedOps: withOnchainOpCalls([
        {
          type: "addCollateral",
          token: UND,
          amount: DEBT + MARGIN,
          value: undefined,
        },
        {
          type: "changeQuota",
          quotaIncrease: [],
          quotaDecrease: [{ token: POS, balance: MIN_INT96 }],
          desiredQuota: {},
        },
        { type: "decreaseDebt", amount: DEBT },
      ]),
      expectedCalls: [
        CA_OP_CALLS.addCollateral,
        CA_OP_CALLS.changeQuota,
        CA_OP_CALLS.decreaseDebt,
      ],
    });

    // The facade is asked for everything outstanding, so the margin is what
    // the interest of the intervening blocks is paid out of; what it does not
    // take stays on the account.
    expect(
      expectOk(result).operations.find(op => op.type === "decreaseDebt"),
    ).toMatchObject({ amount: DEBT, full: true });
    expect(state.quotas).toEqual([]);
    expect(assetBalance(state.assets, UND)).toBe(MARGIN);
  });

  it("MAX_UINT256 on an RWA market charges the margin in the raw asset", async () => {
    const sdk = buildMarketSdk({ rwaAssets: { [UND]: RWA_ASSET } });
    const result = await run(repay(RWA_ASSET, MAX_UINT256), { sdk });

    expectAdjustPreview(result, {
      totalValue: HELD_POS + MARGIN,
      totalDebt: 0n,
      expectedOps: withOnchainOpCalls([
        {
          type: "addCollateral",
          token: RWA_ASSET,
          amount: DEBT + MARGIN,
          value: undefined,
        },
        {
          type: "wrapRwaCollateral",
          tokenIn: RWA_ASSET,
          amount: DEBT + MARGIN,
          tokenOut: UND,
          amountOut: DEBT + MARGIN,
        },
        {
          type: "changeQuota",
          quotaIncrease: [],
          quotaDecrease: [{ token: POS, balance: MIN_INT96 }],
          desiredQuota: {},
        },
        { type: "decreaseDebt", amount: DEBT },
      ]),
      expectedCalls: [
        CA_OP_CALLS.addCollateral,
        MOCK_RWA_WRAP_CALL,
        CA_OP_CALLS.changeQuota,
        CA_OP_CALLS.decreaseDebt,
      ],
    });
  });

  it("RWA market: the asset is wrapped on the way into the debt", async () => {
    const sdk = buildMarketSdk({ rwaAssets: { [UND]: RWA_ASSET } });
    const result = await run(repay(RWA_ASSET, PART), { sdk });

    expectAdjustPreview(result, {
      totalValue: HELD_POS,
      totalDebt: DEBT - PART,
      expectedOps: withOnchainOpCalls([
        {
          type: "addCollateral",
          token: RWA_ASSET,
          amount: PART,
          value: undefined,
        },
        {
          type: "wrapRwaCollateral",
          tokenIn: RWA_ASSET,
          amount: PART,
          tokenOut: UND,
          amountOut: PART,
        },
        { type: "decreaseDebt", amount: PART },
      ]),
      expectedCalls: [
        CA_OP_CALLS.addCollateral,
        MOCK_RWA_WRAP_CALL,
        CA_OP_CALLS.decreaseDebt,
      ],
    });
  });

  it("RWA market: the underlying itself is taken as it is, nothing wrapped", async () => {
    const sdk = buildMarketSdk({ rwaAssets: { [UND]: RWA_ASSET } });
    const result = await run(repay(UND, PART), { sdk });

    const state = expectAdjustPreview(result, {
      totalValue: HELD_POS,
      totalDebt: DEBT - PART,
      expectedOps: withOnchainOpCalls([
        { type: "addCollateral", token: UND, amount: PART, value: undefined },
        { type: "decreaseDebt", amount: PART },
      ]),
      expectedCalls: [CA_OP_CALLS.addCollateral, CA_OP_CALLS.decreaseDebt],
    });

    // the wrap is the raw asset's way in; funding already denominated in the
    // underlying has nowhere to go, and the quotas back a loan that survives
    expect(state.quotas).toMatchObject([
      { token: { address: POS }, value: QUOTA_POS },
    ]);
    expect(assetBalance(state.assets, RWA_ASSET)).toBe(0n);
  });

  it("rejects a payment in anything but the underlying", async () => {
    expectPreviewError(
      await run(repay(POS, PART)),
      "unsupportedCollateralToken",
    );
  });

  it("rejects a non-positive amount", async () => {
    expectPreviewError(await run(repay(UND, 0n)), "insufficientSourceBalance");
  });

  it("rejects an account that owes nothing", async () => {
    expectPreviewError(
      await run(repay(UND, PART), { totalDebt: 0n }),
      "debtOutOfRange",
    );
  });

  it("rejects a payment that would leave the debt below minDebt", async () => {
    // 900 of the 1000 repaid leaves 100, and this facade wants 500 or nothing.
    const sdk = buildMarketSdk({ minDebt: 50000000000n });
    expectPreviewError(
      await run(repay(UND, DEBT - 10000000000n), { sdk }),
      "debtOutOfRange",
    );
  });
});

describe("maxRepay — what clearing the account costs", () => {
  it("is the debt as read, interest and fees included", () => {
    const sdk = buildMarketSdk();
    const service = new CreditAccountOperationsService(sdk);

    expect(
      service.maxRepay({
        creditAccount: buildFixtureCreditAccount({
          totalDebt: DEBT,
          tokens: [caToken(POS, HELD_POS, QUOTA_POS)],
        }),
        sdk,
      }),
    ).toBe(DEBT);
  });
});
