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
/** Payout plus proportional repayment. */
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
  accountDebt: bigint;
  totalValue: bigint;
  accountDebtAfter: bigint;
  ops: ExpectedFlowOp[];
  rwaAssets?: Record<Address, Address>;
}

const base = {
  accountDebt: DEBT_BEFORE,
  totalValue: TVL_AFTER,
  accountDebtAfter: DEBT_AFTER,
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

/** Row 2 — S = U, T = POS: repay, then route the payout out of the underlying. */
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

/** RWA market: the underlying payout is force-unwrapped to the asset. */
export const case_rwa_payout: WithdrawCase = {
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

export function buildWithdrawSdk(c: WithdrawCase): OnchainSDK {
  return buildMarketSdk({ rwaAssets: c.rwaAssets });
}

export function buildWithdrawProps(c: WithdrawCase, sdk: OnchainSDK) {
  return {
    intent: c.intent,
    creditAccount: buildFixtureCreditAccount({
      accountDebt: c.accountDebt,
      tokens: c.tokens,
    }),
    sdk,
    quotaReserve: undefined,
    slippage: undefined,
  };
}
