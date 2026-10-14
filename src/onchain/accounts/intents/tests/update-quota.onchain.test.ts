import { describe, expect, it, vi } from "vitest";

import { CreditAccountOperationsService } from "../index.js";
import {
  assetBalance,
  expectAdjustPreview,
  expectPreviewError,
  withOnchainOpCalls,
} from "../testing/expect.js";
import { ANY, CREDIT_FACADE, UND } from "../testing/market.js";
import { CA_OP_CALLS } from "../testing/sdk-mock.js";
import {
  buildUpdateQuotaProps,
  buildUpdateQuotaSdk,
  case_auto_increase,
  case_target_decrease,
  case_target_disable,
  DEBT,
  TOTAL_VALUE,
  type UpdateQuotaCase,
} from "./update-quota.fixtures.js";

function run(c: UpdateQuotaCase) {
  const sdk = buildUpdateQuotaSdk(c);
  const service = new CreditAccountOperationsService(sdk);
  return { sdk, result: service.startIntent(buildUpdateQuotaProps(c, sdk)) };
}

describe("updateQuota.start — one quota changes, nothing else moves", () => {
  for (const c of [
    case_auto_increase,
    case_target_decrease,
    case_target_disable,
  ]) {
    it(`${c.intent.quota ?? "sized"} → a single updateQuota with minQuota ${c.minQuota}`, async () => {
      const { sdk, result } = run(c);
      const state = expectAdjustPreview(await result, {
        totalValue: TOTAL_VALUE,
        totalDebt: DEBT,
        expectedOps: withOnchainOpCalls([...c.ops]),
        expectedCalls: [CA_OP_CALLS.changeQuota],
      });

      expect(assetBalance(state.quotas, ANY)).toBe(c.quotaAfter);
      expect(vi.mocked(sdk.accounts.prepareUpdateQuotas)).toHaveBeenCalledWith(
        CREDIT_FACADE,
        expect.objectContaining({
          minQuota: [{ token: ANY, balance: c.minQuota }],
        }),
      );
    });
  }

  it("rejects an account with zero debt", async () => {
    const { result } = run({ ...case_auto_increase, totalDebt: 0n });
    expectPreviewError(await result, "debtOutOfRange");
  });

  it("rejects the underlying", async () => {
    const { result } = run({
      ...case_auto_increase,
      intent: { type: "UPDATE_QUOTA", token: UND },
    });
    expectPreviewError(await result, "unsupportedCollateralToken");
  });

  it("rejects a paused facade before anything else", async () => {
    const { result } = run({
      ...case_auto_increase,
      extras: { facadePaused: true },
    });
    expectPreviewError(await result, "creditManagerPaused");
  });

  it("rejects a disable that leaves the account undercollateralised", async () => {
    const { result } = run({ ...case_target_disable, others: [] });
    expectPreviewError(await result, "insufficientCollateral");
  });
});
