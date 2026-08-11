import type {
  DelayedIncreaseLeverageIntent,
  OnchainSDK,
} from "../../../../../index.js";

import type { ClaimDelayedOption } from "../../../operations/index.js";
import type { ResumeCase } from "../../../testing/resume.js";
import {
  ANY,
  buildClaimResumeProps,
  RESUME_FIXTURE_PHANTOM,
  RWA_ASSET,
} from "../../../testing/resume.js";

/**
 * Resume increase-leverage fixtures, ported from intent-calculator
 * `increaseLeverage.flowFixtures.ts` (resume cases only). Shared token / sdk /
 * options helpers live in `testing/resume.ts`.
 */

/** Borrow delta for L0→L1_SIX with fixed collateral. */
export const INCREASE_DEBT_AMOUNT = 1000000000000n;
/** Oracle swap out for `INCREASE_DEBT_AMOUNT` und → ANY. */
const ANY_SWAP_AMOUNT_OUT = 20000000000000000000000n;
/** Quota increase for obtained ANY / RWA asset (buyQuotaMode excess). */
export const QUOTA_INCREASE = 920000000000n;
/** Post-borrow / post-claim CA metrics (fixed C). */
export const INCREASE_POST_T = 6000000000000n;
export const INCREASE_POST_D = 5000000000000n;

/**
 * Case 2.1 — NON RWA, target=ANY (borrow stays on CA).
 * Full: increaseDebt → swap(und→any) → changeQuota(any)
 * Resume: claim → changeQuota(any)
 */
export const case_2_1_any: ResumeCase = {
  claimedToken: ANY,
  claimedAmount: ANY_SWAP_AMOUNT_OUT,
  postClaimTotalValue: INCREASE_POST_T,
  postClaimDebt: INCREASE_POST_D,
  resumeOps: [
    {
      type: "claimDelayedWithdrawal",
      token: ANY,
      withdrawalPhantomToken: RESUME_FIXTURE_PHANTOM,
      withdrawalTokenSpent: ANY_SWAP_AMOUNT_OUT,
      outputs: [{ token: ANY, amount: ANY_SWAP_AMOUNT_OUT, isDelayed: false }],
      calls: [],
    },
    {
      type: "changeQuota",
      quotaIncrease: [{ token: ANY, balance: QUOTA_INCREASE }],
      quotaDecrease: [],
      desiredQuota: {},
    },
  ],
};

/**
 * Case 1.2 — RWA, target=asset.
 * Full: increaseDebt → unwrap(und→asset) → changeQuota(asset)
 * Resume: claim(asset) → changeQuota(asset)
 */
export const case_1_2_asset_rwa: ResumeCase = {
  claimedToken: RWA_ASSET,
  claimedAmount: INCREASE_DEBT_AMOUNT,
  postClaimTotalValue: INCREASE_POST_T,
  postClaimDebt: INCREASE_POST_D,
  resumeOps: [
    {
      type: "claimDelayedWithdrawal",
      token: RWA_ASSET,
      withdrawalPhantomToken: RESUME_FIXTURE_PHANTOM,
      withdrawalTokenSpent: INCREASE_DEBT_AMOUNT,
      outputs: [
        { token: RWA_ASSET, amount: INCREASE_DEBT_AMOUNT, isDelayed: false },
      ],
      calls: [],
    },
    {
      type: "changeQuota",
      quotaIncrease: [{ token: RWA_ASSET, balance: QUOTA_INCREASE }],
      quotaDecrease: [],
      desiredQuota: {},
    },
  ],
};

export function buildResumeIncreaseLeverageProps(args: {
  case: ResumeCase;
  sdk: OnchainSDK;
  options: ClaimDelayedOption;
}) {
  return buildClaimResumeProps({
    intent: { type: "INCREASE_LEVERAGE" } as DelayedIncreaseLeverageIntent,
    case: args.case,
    sdk: args.sdk,
    options: args.options,
  });
}
