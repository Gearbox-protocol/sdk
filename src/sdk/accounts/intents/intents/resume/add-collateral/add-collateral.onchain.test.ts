import { describe, expect, it } from "vitest";

import { CreditAccountOperationsService } from "../../../index.js";
import {
  assetBalance,
  expectAdjustResumePreview,
} from "../../../testing/expect.js";
import { CA_OP_CALLS, MOCK_CLAIM_CALL } from "../../../testing/sdk-mock.js";
import {
  buildOnchainOptions,
  buildResumeAddCollateralProps,
  buildResumeSdk,
  case_1_2_und_any,
  case_1_7_any_rwa,
  case_claimed_und,
  type ResumeCase,
} from "./add-collateral.fixtures.js";

function runResume(c: ResumeCase) {
  const sdk = buildResumeSdk(c);
  const service = new CreditAccountOperationsService(sdk);
  const props = buildResumeAddCollateralProps({
    case: c,
    sdk,
    options: buildOnchainOptions(c),
  });
  return service.finishAddCollateralIntent(props);
}

describe("addCollateral.resume onchain — quota-only after claim", () => {
  it("claimed ANY → changeQuota (flow 1.2: C=und, T=any)", async () => {
    const result = await runResume(case_1_2_und_any);
    const state = expectAdjustResumePreview(result, {
      totalValue: case_1_2_und_any.postClaimTotalValue,
      accountDebt: case_1_2_und_any.postClaimDebt,
      expectedOps: [...case_1_2_und_any.resumeOps],
      expectedCalls: [MOCK_CLAIM_CALL, CA_OP_CALLS.changeQuota],
    });

    expect(assetBalance(state.assets, case_1_2_und_any.claimedToken)).toBe(
      case_1_2_und_any.claimedAmount,
    );
    expect(state.quotas[case_1_2_und_any.claimedToken]?.balance).toBe(
      case_1_2_und_any.expectedQuotaBalance,
    );
  });

  it("claimed RWA asset → changeQuota (flow 1.7: C=any, T=asset)", async () => {
    const result = await runResume(case_1_7_any_rwa);
    const state = expectAdjustResumePreview(result, {
      totalValue: case_1_7_any_rwa.postClaimTotalValue,
      accountDebt: case_1_7_any_rwa.postClaimDebt,
      expectedOps: [...case_1_7_any_rwa.resumeOps],
      expectedCalls: [MOCK_CLAIM_CALL, CA_OP_CALLS.changeQuota],
    });

    expect(assetBalance(state.assets, case_1_7_any_rwa.claimedToken)).toBe(
      case_1_7_any_rwa.claimedAmount,
    );
    expect(state.quotas[case_1_7_any_rwa.claimedToken]?.balance).toBe(
      case_1_7_any_rwa.expectedQuotaBalance,
    );
  });

  it("claimed UND → empty ops (und not on active quota-buy path)", async () => {
    const result = await runResume(case_claimed_und);
    const state = expectAdjustResumePreview(result, {
      totalValue: case_claimed_und.postClaimTotalValue,
      accountDebt: case_claimed_und.postClaimDebt,
      expectedOps: [...case_claimed_und.resumeOps],
      expectedCalls: [MOCK_CLAIM_CALL],
    });

    expect(assetBalance(state.assets, case_claimed_und.claimedToken)).toBe(
      case_claimed_und.claimedAmount,
    );
  });
});
