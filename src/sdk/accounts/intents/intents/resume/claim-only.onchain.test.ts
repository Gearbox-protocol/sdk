import { describe, expect, it } from "vitest";

import type { DelayedIntent } from "../../../withdrawal-compressor/types.js";
import { CreditAccountOperationsService } from "../../index.js";
import {
  assetBalance,
  expectAdjustResumePreview,
  withOnchainOpCalls,
} from "../../testing/expect.js";
import {
  ANY,
  buildClaimResumeProps,
  buildResumeSdk,
  RESUME_FIXTURE_PHANTOM,
  type ResumeCase,
  RWA_ASSET,
  UND,
} from "../../testing/resume.js";
import { CA_OP_CALLS, MOCK_CLAIM_CALL } from "../../testing/sdk-mock.js";

/**
 * The four intents whose delayed tail is the claim and nothing else: the tokens
 * simply arrive on the account, so all that is left is to buy the quota that
 * makes them count as collateral.
 *
 * Ported from the intent-calculator `addCollateral` / `increaseLeverage` /
 * `deposit` resume fixtures, which were identical case for case.
 */
const CLAIM_ONLY_INTENTS = [
  "ADD_COLLATERAL",
  "INCREASE_LEVERAGE",
  "DEPOSIT",
  "DEPOSIT_AND_INCREASE_LEVERAGE",
] as const;

const ADD_UND = 100000000000n;
const ANY_CLAIMED = 2000000000000000000000n;
const RWA_CLAIMED = 100000000000n;
const QUOTA_INCREASE = 92000000000n;

/** Post-claim metrics after adding und-worth collateral (fixed debt). */
const ADD_T1 = 5100000000000n;
const ADD_D1 = 4000000000000n;

/** Claim lands in a plain collateral token, which then needs a quota. */
const claimedAny: ResumeCase = {
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

/** Same shape on an RWA market, where the claim lands in the RWA asset. */
const claimedRwaAsset: ResumeCase = {
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

/** The underlying needs no quota, so the claim is the whole tail. */
const claimedUnderlying: ResumeCase = {
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

function runResume(c: ResumeCase, type: (typeof CLAIM_ONLY_INTENTS)[number]) {
  const sdk = buildResumeSdk(c);
  const service = new CreditAccountOperationsService(sdk);
  return service.finishIntent(
    buildClaimResumeProps({
      intent: { type } as DelayedIntent,
      case: c,
      sdk,
    }),
  );
}

describe.each(CLAIM_ONLY_INTENTS)("%s.resume — claim then quota", type => {
  it("claimed collateral token → changeQuota", async () => {
    const state = expectAdjustResumePreview(await runResume(claimedAny, type), {
      totalValue: claimedAny.postClaimTotalValue,
      accountDebt: claimedAny.postClaimDebt,
      expectedOps: withOnchainOpCalls([...claimedAny.resumeOps]),
      expectedCalls: [MOCK_CLAIM_CALL, CA_OP_CALLS.changeQuota],
    });

    expect(assetBalance(state.assets, ANY)).toBe(ANY_CLAIMED);
    expect(state.quotas[ANY]?.balance).toBe(QUOTA_INCREASE);
  });

  it("claimed RWA asset → changeQuota", async () => {
    const state = expectAdjustResumePreview(
      await runResume(claimedRwaAsset, type),
      {
        totalValue: claimedRwaAsset.postClaimTotalValue,
        accountDebt: claimedRwaAsset.postClaimDebt,
        expectedOps: withOnchainOpCalls([...claimedRwaAsset.resumeOps]),
        expectedCalls: [MOCK_CLAIM_CALL, CA_OP_CALLS.changeQuota],
      },
    );

    expect(assetBalance(state.assets, RWA_ASSET)).toBe(RWA_CLAIMED);
    expect(state.quotas[RWA_ASSET]?.balance).toBe(QUOTA_INCREASE);
  });

  it("claimed underlying → claim only, no quota to buy", async () => {
    const state = expectAdjustResumePreview(
      await runResume(claimedUnderlying, type),
      {
        totalValue: claimedUnderlying.postClaimTotalValue,
        accountDebt: claimedUnderlying.postClaimDebt,
        expectedOps: withOnchainOpCalls([...claimedUnderlying.resumeOps]),
        expectedCalls: [MOCK_CLAIM_CALL],
      },
    );

    expect(assetBalance(state.assets, UND)).toBe(ADD_UND);
  });
});
