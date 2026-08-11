import { describe, expect, it } from "vitest";

import { CreditAccountOperationsService } from "../../../index.js";
import {
  assetBalance,
  expectAdjustResumePreview,
  withOnchainOpCalls,
} from "../../../testing/expect.js";
import type { ResumeCase } from "../../../testing/resume.js";
import {
  buildOnchainOptions,
  buildResumeSdk,
} from "../../../testing/resume.js";
import { CA_OP_CALLS, MOCK_CLAIM_CALL } from "../../../testing/sdk-mock.js";
import {
  buildResumeIncreaseLeverageProps,
  case_1_2_asset_rwa,
  case_2_1_any,
  INCREASE_POST_D,
  INCREASE_POST_T,
} from "./increase-leverage.fixtures.js";

function runResume(c: ResumeCase) {
  const sdk = buildResumeSdk(c);
  const service = new CreditAccountOperationsService(sdk);
  const props = buildResumeIncreaseLeverageProps({
    case: c,
    sdk,
    options: buildOnchainOptions(c),
  });
  return service.finishIntent(props);
}

describe("increaseLeverage.resume onchain — claim keeps proceeds on CA", () => {
  it("A (= flow 2.1): claimed ANY → changeQuota + preview state", async () => {
    const result = await runResume(case_2_1_any);

    const state = expectAdjustResumePreview(result, {
      totalValue: INCREASE_POST_T,
      accountDebt: INCREASE_POST_D,
      expectedOps: withOnchainOpCalls([...case_2_1_any.resumeOps]),
      expectedCalls: [MOCK_CLAIM_CALL, CA_OP_CALLS.changeQuota],
    });

    expect(assetBalance(state.assets, case_2_1_any.claimedToken)).toBe(
      case_2_1_any.claimedAmount,
    );
  });

  it("B (= flow 1.2): claimed RWA asset → changeQuota + preview state", async () => {
    const result = await runResume(case_1_2_asset_rwa);

    const state = expectAdjustResumePreview(result, {
      totalValue: INCREASE_POST_T,
      accountDebt: INCREASE_POST_D,
      expectedOps: withOnchainOpCalls([...case_1_2_asset_rwa.resumeOps]),
      expectedCalls: [MOCK_CLAIM_CALL, CA_OP_CALLS.changeQuota],
    });

    expect(assetBalance(state.assets, case_1_2_asset_rwa.claimedToken)).toBe(
      case_1_2_asset_rwa.claimedAmount,
    );
  });
});
