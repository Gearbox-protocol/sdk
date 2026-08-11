import type {
  DelayedAddCollateralIntent,
  OnchainSDK,
} from "../../../../../index.js";

import type { ClaimDelayedOption } from "../../../operations/index.js";
import type { ResumeCase } from "../../../testing/resume.js";
import {
  ANY,
  buildClaimResumeProps,
  buildOffchainOptions,
  buildOnchainOptions,
  buildResumeSdk,
  RESUME_FIXTURE_PHANTOM,
  RWA_ASSET,
  UND,
} from "../../../testing/resume.js";

/**
 * Resume add-collateral fixtures, ported from intent-calculator
 * `addCollateral.flowFixtures.ts` (resume cases only). Shared token / sdk /
 * options helpers live in `testing/resume.ts`.
 */

export type { ResumeCase };
export {
  ANY,
  buildOffchainOptions,
  buildOnchainOptions,
  buildResumeSdk,
  RWA_ASSET,
  UND,
};

export const ADD_UND = 100000000000n;
export const ANY_CLAIMED = 2000000000000000000000n;
export const RWA_CLAIMED = 100000000000n;
export const QUOTA_INCREASE = 92000000000n;

/** Post-claim metrics after add und-worth collateral (fixed debt). */
const ADD_T1 = 5100000000000n;
const ADD_D1 = 4000000000000n;

/**
 * Flow 1.2 — C=und, T=any (swap then quota).
 * Resume: changeQuota(ANY) only.
 */
export const case_1_2_und_any: ResumeCase = {
  claimedToken: ANY,
  claimedAmount: ANY_CLAIMED,
  postClaimTotalValue: ADD_T1,
  postClaimDebt: ADD_D1,
  resumeOps: [
    {
      type: "claimDelayedWithdrawal",
      token: ANY,
      withdrawalPhantomToken: RESUME_FIXTURE_PHANTOM,
      withdrawalTokenSpent: ANY_CLAIMED,
      outputs: [{ token: ANY, amount: ANY_CLAIMED, isDelayed: false }],
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
 * Flow 1.7 — C=any, T=asset (swap then quota).
 * Resume: changeQuota(RWA) only.
 */
export const case_1_7_any_rwa: ResumeCase = {
  claimedToken: RWA_ASSET,
  claimedAmount: RWA_CLAIMED,
  postClaimTotalValue: ADD_T1,
  postClaimDebt: ADD_D1,
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
  claimedAmount: ADD_UND,
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
      withdrawalTokenSpent: ADD_UND,
      outputs: [{ token: UND, amount: ADD_UND, isDelayed: false }],
      calls: [],
    },
  ],
};

export function buildResumeAddCollateralProps(args: {
  case: ResumeCase;
  sdk: OnchainSDK;
  options: ClaimDelayedOption;
}) {
  return buildClaimResumeProps({
    intent: { type: "ADD_COLLATERAL" } as DelayedAddCollateralIntent,
    case: args.case,
    sdk: args.sdk,
    options: args.options,
  });
}
