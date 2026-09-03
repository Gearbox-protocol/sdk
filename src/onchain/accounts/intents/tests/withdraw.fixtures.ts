import type { Address } from "viem";
import type { OnchainSDK } from "../../../index.js";
import type { ExpectedFlowOp } from "../testing/expect.js";
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
import type { WithdrawStrategyIntent } from "../types.js";

/**
 * Start withdraw fixtures (intent 2.1) — one per row of the S/T matrix.
 *
 * Every case starts from 2000 UND of TVL against 1000 UND of debt: 1000 UND of
 * collateral at 2x. Withdrawing 100 UND of value therefore repays 100 of debt
 * (`dD = D0 * W / C0`), so 200 UND of value must be liquidated in total and the
 * account settles at 1800 TVL / 900 debt — still 2x.
 *
 * `POS` and `POS2` both convert 1:1 with `UND`, keeping swap amounts honest
 * against the mock router, which echoes its input amount.
 */

const LT = 9200n;
const quotaOf = (balance: bigint) => (balance * LT) / 10000n;

/** 100 UND of value leaving the account. */
export const W = 10000000000n;
/** Withdrawal plus proportional repayment. */
export const SPEND = 2n * W;

export const TVL_BEFORE = 200000000000n;
export const DEBT_BEFORE = 100000000000n;
export const TVL_AFTER = TVL_BEFORE - SPEND;
export const DEBT_AFTER = DEBT_BEFORE - W;

export const QUOTA_BEFORE = quotaOf(TVL_BEFORE);
export const QUOTA_AFTER = quotaOf(TVL_AFTER);
/** Quota ops carry signed deltas. */
export const QUOTA_DELTA = QUOTA_AFTER - QUOTA_BEFORE;

export interface WithdrawCase {
  intent: WithdrawStrategyIntent;
  tokens: ReturnType<typeof caToken>[];
  totalDebt: bigint;
  totalValue: bigint;
  totalDebtAfter: bigint;
  ops: ExpectedFlowOp[];
  rwaAssets?: Record<Address, Address>;
}

const base = {
  totalDebt: DEBT_BEFORE,
  totalValue: TVL_AFTER,
  totalDebtAfter: DEBT_AFTER,
};

/** Row 1 — S = U, T = U: repay, then hand over the underlying. */
export const case_und_und: WithdrawCase = {
  ...base,
  intent: { type: "WITHDRAW", amount: W, to: WALLET },
  tokens: [caToken(UND, TVL_BEFORE)],
  ops: [
    { type: "decreaseDebt", amount: W },
    { type: "withdrawCollateral", token: UND, amount: W, to: WALLET },
  ],
};

/** Row 2 — S = U, T = POS: repay, then route the withdrawal out of the underlying. */
export const case_und_pos: WithdrawCase = {
  ...base,
  intent: { type: "WITHDRAW", amount: W, to: WALLET, tokenOut: POS },
  tokens: [caToken(UND, TVL_BEFORE)],
  ops: [
    { type: "decreaseDebt", amount: W },
    {
      type: "swap",
      from: [{ token: UND, balance: W }],
      tokenOut: POS,
      amountOut: W,
    },
    { type: "withdrawCollateral", token: POS, amount: W, to: WALLET },
  ],
};

/** Row 3 — S = POS, T = U: both legs land in the underlying, so one swap covers them. */
export const case_pos_und: WithdrawCase = {
  ...base,
  intent: { type: "WITHDRAW", amount: W, to: WALLET, sourceToken: POS },
  tokens: [caToken(POS, TVL_BEFORE, QUOTA_BEFORE)],
  ops: [
    {
      type: "swap",
      from: [{ token: POS, balance: SPEND }],
      tokenOut: UND,
      amountOut: SPEND,
    },
    { type: "decreaseDebt", amount: W },
    { type: "withdrawCollateral", token: UND, amount: W, to: WALLET },
    {
      type: "changeQuota",
      quotaIncrease: [],
      quotaDecrease: [{ token: POS, balance: QUOTA_DELTA }],
      desiredQuota: {},
    },
  ],
};

/** Row 4 — S = T = POS: only the repayment needs routing. */
export const case_pos_pos: WithdrawCase = {
  ...base,
  intent: {
    type: "WITHDRAW",
    amount: W,
    to: WALLET,
    sourceToken: POS,
    tokenOut: POS,
  },
  tokens: [caToken(POS, TVL_BEFORE, QUOTA_BEFORE)],
  ops: [
    {
      type: "swap",
      from: [{ token: POS, balance: W }],
      tokenOut: UND,
      amountOut: W,
    },
    { type: "decreaseDebt", amount: W },
    { type: "withdrawCollateral", token: POS, amount: W, to: WALLET },
    {
      type: "changeQuota",
      quotaIncrease: [],
      quotaDecrease: [{ token: POS, balance: QUOTA_DELTA }],
      desiredQuota: {},
    },
  ],
};

/** Row 5 — S = POS, T = POS2: two independent legs out of the same source. */
export const case_pos_pos2: WithdrawCase = {
  ...base,
  intent: {
    type: "WITHDRAW",
    amount: W,
    to: WALLET,
    sourceToken: POS,
    tokenOut: POS2,
  },
  tokens: [caToken(POS, TVL_BEFORE, QUOTA_BEFORE)],
  ops: [
    {
      type: "swap",
      from: [{ token: POS, balance: W }],
      tokenOut: UND,
      amountOut: W,
    },
    { type: "decreaseDebt", amount: W },
    {
      type: "swap",
      from: [{ token: POS, balance: W }],
      tokenOut: POS2,
      amountOut: W,
    },
    { type: "withdrawCollateral", token: POS2, amount: W, to: WALLET },
    {
      type: "changeQuota",
      quotaIncrease: [],
      quotaDecrease: [{ token: POS, balance: QUOTA_DELTA }],
      desiredQuota: {},
    },
  ],
};

/** RWA market: the underlying withdrawal is force-unwrapped to the asset. */
export const case_rwa_pos_und: WithdrawCase = {
  ...base,
  intent: { type: "WITHDRAW", amount: W, to: WALLET, sourceToken: POS },
  tokens: [caToken(POS, TVL_BEFORE, QUOTA_BEFORE)],
  ops: [
    {
      type: "swap",
      from: [{ token: POS, balance: SPEND }],
      tokenOut: UND,
      amountOut: SPEND,
    },
    { type: "decreaseDebt", amount: W },
    {
      type: "unwrapRwaCollateral",
      tokenIn: UND,
      amount: W,
      tokenOut: RWA_ASSET,
      amountOut: W,
    },
    { type: "withdrawCollateral", token: RWA_ASSET, amount: W, to: WALLET },
    {
      type: "changeQuota",
      quotaIncrease: [],
      quotaDecrease: [{ token: POS, balance: QUOTA_DELTA }],
      desiredQuota: {},
    },
  ],
  rwaAssets: { [UND]: RWA_ASSET },
};

// ---------------------------------------------------------------------------
// Test-matrix rows 4.1 / 4.2 — 1U withdrawal from a 10U/8U (5x) account
// ---------------------------------------------------------------------------

/** Matrix baseline: 10A of position against 8U of debt (2U collateral at 5x). */
export const M4_BALANCE = 1000000000n;
export const M4_DEBT = 800000000n;
/** Matrix withdrawal W: 1U. */
export const M4_W = 100000000n;
/** Proportional repayment `dD = D0 * W / C0` = 4U. */
export const M4_DD = 400000000n;
/** Withdrawal plus repayment: 5U liquidated in total. */
export const M4_SPEND = M4_W + M4_DD;

/**
 * Matrix 4.1 — withdraw 1U, source `POS`, tokenOut `UND`.
 *
 * MATRIX MISMATCH: the matrix withdraws first — `swap → withdrawCollateral →
 * decreaseDebt → changeQuota`. The engine repays before withdrawing
 * (`repay(dD, keep: W)` precedes the withdrawal leg in `planWithdraw`):
 * `swap → decreaseDebt → withdrawCollateral → changeQuota`. Amounts are
 * identical; only the order differs.
 */
export const case_matrix_4_1: WithdrawCase = {
  intent: { type: "WITHDRAW", amount: M4_W, to: WALLET, sourceToken: POS },
  tokens: [caToken(POS, M4_BALANCE, quotaOf(M4_BALANCE))],
  totalDebt: M4_DEBT,
  totalValue: M4_SPEND,
  totalDebtAfter: M4_DD,
  ops: [
    {
      type: "swap",
      from: [{ token: POS, balance: M4_SPEND }],
      tokenOut: UND,
      amountOut: M4_SPEND,
    },
    { type: "decreaseDebt", amount: M4_DD },
    { type: "withdrawCollateral", token: UND, amount: M4_W, to: WALLET },
    {
      type: "changeQuota",
      quotaIncrease: [],
      quotaDecrease: [
        { token: POS, balance: quotaOf(M4_SPEND) - quotaOf(M4_BALANCE) },
      ],
      desiredQuota: {},
    },
  ],
};

/**
 * Matrix 4.2 — 4.1 on the RWA market: the withdrawal is unwrapped on the way out.
 *
 * MATRIX MISMATCH: same ordering divergence as 4.1 — the matrix expects
 * `swap → unwrapRwaCollateral → withdrawCollateral(RWA) → decreaseDebt →
 * changeQuota`, the engine repays first:
 * `swap → decreaseDebt → unwrapRwaCollateral → withdrawCollateral(RWA) →
 * changeQuota`.
 */
export const case_matrix_4_2: WithdrawCase = {
  intent: { type: "WITHDRAW", amount: M4_W, to: WALLET, sourceToken: POS },
  tokens: [caToken(POS, M4_BALANCE, quotaOf(M4_BALANCE))],
  totalDebt: M4_DEBT,
  totalValue: M4_SPEND,
  totalDebtAfter: M4_DD,
  ops: [
    {
      type: "swap",
      from: [{ token: POS, balance: M4_SPEND }],
      tokenOut: UND,
      amountOut: M4_SPEND,
    },
    { type: "decreaseDebt", amount: M4_DD },
    {
      type: "unwrapRwaCollateral",
      tokenIn: UND,
      amount: M4_W,
      tokenOut: RWA_ASSET,
      amountOut: M4_W,
    },
    { type: "withdrawCollateral", token: RWA_ASSET, amount: M4_W, to: WALLET },
    {
      type: "changeQuota",
      quotaIncrease: [],
      quotaDecrease: [
        { token: POS, balance: quotaOf(M4_SPEND) - quotaOf(M4_BALANCE) },
      ],
      desiredQuota: {},
    },
  ],
  rwaAssets: { [UND]: RWA_ASSET },
};

export function buildWithdrawSdk(c: WithdrawCase): OnchainSDK {
  return buildMarketSdk({ rwaAssets: c.rwaAssets });
}

export function buildWithdrawProps(c: WithdrawCase, sdk: OnchainSDK) {
  return {
    intent: c.intent,
    creditAccount: buildFixtureCreditAccount({
      totalDebt: c.totalDebt,
      tokens: c.tokens,
    }),
    sdk,
    quotaReserve: undefined,
    slippage: undefined,
  };
}
