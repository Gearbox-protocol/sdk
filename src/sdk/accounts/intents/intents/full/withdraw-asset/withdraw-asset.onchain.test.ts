import { describe, expect, it } from "vitest";

import { CreditAccountOperationsService } from "../../../index.js";
import {
  assetBalance,
  expectAdjustPreview,
  expectPreviewError,
  withOnchainOpCalls,
} from "../../../testing/expect.js";
import { ANY, RWA_ASSET, UND } from "../../../testing/market.js";
import {
  CA_OP_CALLS,
  MOCK_RWA_UNWRAP_CALL,
} from "../../../testing/sdk-mock.js";
import {
  buildWithdrawAssetProps,
  buildWithdrawAssetSdk,
  case_any_token,
  case_rwa_underlying,
  case_underlying,
  HELD_ANY,
  HELD_UND,
  OUT_ANY,
  OUT_UND,
  QUOTA_ANY_AFTER,
  type WithdrawAssetCase,
} from "./withdraw-asset.fixtures.js";

function run(c: WithdrawAssetCase) {
  const sdk = buildWithdrawAssetSdk(c);
  const service = new CreditAccountOperationsService(sdk);
  return service.startIntent(buildWithdrawAssetProps(c, sdk));
}

describe("withdrawAsset.start — one held asset out, debt fixed", () => {
  it("quota token → withdrawCollateral + quota decrease", async () => {
    const result = await run(case_any_token);
    const state = expectAdjustPreview(result, {
      totalValue: case_any_token.totalValue,
      accountDebt: case_any_token.accountDebt,
      expectedOps: withOnchainOpCalls([...case_any_token.ops]),
      expectedCalls: [CA_OP_CALLS.withdrawCollateral, CA_OP_CALLS.changeQuota],
    });

    expect(assetBalance(state.assets, ANY)).toBe(HELD_ANY - OUT_ANY);
    expect(state.quotas[ANY]?.balance).toBe(QUOTA_ANY_AFTER);
    expect(state.accountDebt).toBe(case_any_token.accountDebt);
  });

  it("underlying → withdrawCollateral only", async () => {
    const result = await run(case_underlying);
    const state = expectAdjustPreview(result, {
      totalValue: case_underlying.totalValue,
      accountDebt: case_underlying.accountDebt,
      expectedOps: withOnchainOpCalls([...case_underlying.ops]),
      expectedCalls: [CA_OP_CALLS.withdrawCollateral],
    });

    expect(assetBalance(state.assets, UND)).toBe(HELD_UND - OUT_UND);
  });

  it("underlying on an RWA market → forced unwrap, then withdraw rwa asset", async () => {
    const result = await run(case_rwa_underlying);
    const state = expectAdjustPreview(result, {
      totalValue: case_rwa_underlying.totalValue,
      accountDebt: case_rwa_underlying.accountDebt,
      expectedOps: withOnchainOpCalls([...case_rwa_underlying.ops]),
      expectedCalls: [MOCK_RWA_UNWRAP_CALL, CA_OP_CALLS.withdrawCollateral],
    });

    expect(assetBalance(state.assets, UND)).toBe(HELD_UND - OUT_UND);
    expect(assetBalance(state.assets, RWA_ASSET)).toBe(0n);
  });

  it("rejects withdrawing more than the account holds", async () => {
    const result = await run({
      ...case_any_token,
      intent: { ...case_any_token.intent, amount: HELD_ANY + 1n },
    });
    expectPreviewError(result, "insufficientSourceBalance");
  });

  it("rejects a token that is not on the account", async () => {
    const result = await run({
      ...case_underlying,
      intent: { ...case_underlying.intent, token: ANY, amount: OUT_ANY },
    });
    expectPreviewError(result, "insufficientSourceBalance");
  });
});
