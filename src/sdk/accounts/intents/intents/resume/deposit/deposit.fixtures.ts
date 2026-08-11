import type {
  DelayedDepositAndIncreaseLeverageIntent,
  DelayedDepositIntent,
  OnchainSDK,
} from "../../../../../index.js";

import type { ClaimDelayedOption } from "../../../operations/index.js";
import type { ResumeCase } from "../../../testing/resume.js";
import {
  ANY,
  buildClaimResumeProps,
  RESUME_FIXTURE_PHANTOM,
  RWA_ASSET,
  UND,
} from "../../../testing/resume.js";

/**
 * Resume deposit fixtures, ported from intent-calculator
 * `deposit.flowFixtures.ts` (resume cases only). Shared by DEPOSIT and
 * DEPOSIT_AND_INCREASE_LEVERAGE (mirrors legacy `buildDepositResumeLogicalOps`).
 * Shared token / sdk / options helpers live in `testing/resume.ts`.
 */

export type DepositLikeDelayedIntent =
  | DelayedDepositIntent
  | DelayedDepositAndIncreaseLeverageIntent;

/** Shared op amounts from deposit.flow (fixed-L collateral-up). */
export const DEPOSIT_ADD_UND = 100000000000n;
export const ANY_SWAP_OUT = 10000000000000000000000n;
const RWA_CLAIMED = 500000000000n;
export const QUOTA_INCREASE = 460000000000n;

/** Post-claim metrics after fixed-L deposit (literals, not derived). */
const DEPOSIT_T1 = 5500000000000n;
const DEPOSIT_D1 = 4400000000000n;

/**
 * Flow B non-RWA: C=und, T=any.
 * Full: add + increaseDebt + swap(und→any) + changeQuota
 * Resume: changeQuota only
 */
export const case_b_und_any: ResumeCase = {
  claimedToken: ANY,
  claimedAmount: ANY_SWAP_OUT,
  postClaimTotalValue: DEPOSIT_T1,
  postClaimDebt: DEPOSIT_D1,
  resumeOps: [
    {
      type: "claimDelayedWithdrawal",
      token: ANY,
      withdrawalPhantomToken: RESUME_FIXTURE_PHANTOM,
      withdrawalTokenSpent: ANY_SWAP_OUT,
      outputs: [{ token: ANY, amount: ANY_SWAP_OUT, isDelayed: false }],
      calls: [],
    },
    {
      type: "changeQuota",
      quotaIncrease: [{ token: ANY, balance: QUOTA_INCREASE }],
      quotaDecrease: [],
      desiredQuota: {},
    },
  ],
  expectedQuotaBalance: QUOTA_INCREASE,
};

/**
 * Flow B RWA: C=und, T=asset.
 * Full: add + increaseDebt + swap + unwrap + changeQuota
 * Resume: changeQuota only
 */
export const case_b_und_rwa: ResumeCase = {
  claimedToken: RWA_ASSET,
  claimedAmount: RWA_CLAIMED,
  postClaimTotalValue: DEPOSIT_T1,
  postClaimDebt: DEPOSIT_D1,
  resumeOps: [
    {
      type: "claimDelayedWithdrawal",
      token: RWA_ASSET,
      withdrawalPhantomToken: RESUME_FIXTURE_PHANTOM,
      withdrawalTokenSpent: RWA_CLAIMED,
      outputs: [{ token: RWA_ASSET, amount: RWA_CLAIMED, isDelayed: false }],
      calls: [],
    },
    {
      type: "changeQuota",
      quotaIncrease: [{ token: RWA_ASSET, balance: QUOTA_INCREASE }],
      quotaDecrease: [],
      desiredQuota: {},
    },
  ],
  expectedQuotaBalance: QUOTA_INCREASE,
};

/** Claimed und — no active quota-buy path. */
export const case_claimed_und: ResumeCase = {
  claimedToken: UND,
  claimedAmount: DEPOSIT_ADD_UND,
  postClaimTotalValue: 5000000000000n,
  postClaimDebt: 4000000000000n,
  // 98000 ANY @ $1 vs UND @ $2 = 49000e8 UND; + claimed 1000e8 = 50000e8 TV.
  baseAssets: [
    {
      token: ANY,
      balance: 98000000000000000000000n,
      quota: 0n,
      mask: 0n,
      success: true,
    },
  ],
  resumeOps: [
    {
      type: "claimDelayedWithdrawal",
      token: UND,
      withdrawalPhantomToken: RESUME_FIXTURE_PHANTOM,
      withdrawalTokenSpent: DEPOSIT_ADD_UND,
      outputs: [{ token: UND, amount: DEPOSIT_ADD_UND, isDelayed: false }],
      calls: [],
    },
  ],
};

export function buildResumeDepositProps<
  T extends DepositLikeDelayedIntent,
>(args: {
  case: ResumeCase;
  sdk: OnchainSDK;
  options: ClaimDelayedOption;
  delayedIntent: T;
}) {
  return buildClaimResumeProps({
    intent: args.delayedIntent,
    case: args.case,
    sdk: args.sdk,
    options: args.options,
  });
}
