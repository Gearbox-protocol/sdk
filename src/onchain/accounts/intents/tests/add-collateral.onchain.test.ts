import { describe, expect, it } from "vitest";

import { CreditAccountOperationsService } from "../index.js";
import {
  assetBalance,
  expectAdjustPreview,
  expectPreviewError,
  withOnchainOpCalls,
} from "../testing/expect.js";
import { ANY, RWA_ASSET, UND } from "../testing/market.js";
import { CA_OP_CALLS } from "../testing/sdk-mock.js";
import {
  ADD_ANY,
  ADD_RWA,
  ADD_UND,
  type AddCollateralCase,
  buildAddCollateralProps,
  buildAddCollateralSdk,
  case_position_token,
  case_rwa_asset,
  case_underlying,
  QUOTA_ANY,
  QUOTA_RWA,
} from "./add-collateral.fixtures.js";

function run(c: AddCollateralCase) {
  const sdk = buildAddCollateralSdk(c);
  const service = new CreditAccountOperationsService(sdk);
  return service.startIntent(buildAddCollateralProps(c, sdk));
}

describe("addCollateral.start — position token in, debt fixed", () => {
  it("position token → addCollateral + quota increase", async () => {
    const result = await run(case_position_token);
    const state = expectAdjustPreview(result, {
      totalValue: case_position_token.totalValue,
      accountDebt: case_position_token.accountDebt,
      expectedOps: withOnchainOpCalls([...case_position_token.ops]),
      expectedCalls: [CA_OP_CALLS.addCollateral, CA_OP_CALLS.changeQuota],
    });

    expect(assetBalance(state.assets, ANY)).toBe(ADD_ANY);
    expect(state.quotas[ANY]?.balance).toBe(QUOTA_ANY);
    expect(state.accountDebt).toBe(case_position_token.accountDebt);
  });

  it("underlying → addCollateral only (underlying has no quota)", async () => {
    const result = await run(case_underlying);
    const state = expectAdjustPreview(result, {
      totalValue: case_underlying.totalValue,
      accountDebt: case_underlying.accountDebt,
      expectedOps: withOnchainOpCalls([...case_underlying.ops]),
      expectedCalls: [CA_OP_CALLS.addCollateral],
    });

    expect(assetBalance(state.assets, UND)).toBe(ADD_UND);
  });

  it("rwa asset on an RWA market → addCollateral, no wrap leg", async () => {
    const result = await run(case_rwa_asset);
    const state = expectAdjustPreview(result, {
      totalValue: case_rwa_asset.totalValue,
      accountDebt: case_rwa_asset.accountDebt,
      expectedOps: withOnchainOpCalls([...case_rwa_asset.ops]),
      expectedCalls: [CA_OP_CALLS.addCollateral, CA_OP_CALLS.changeQuota],
    });

    expect(assetBalance(state.assets, RWA_ASSET)).toBe(ADD_RWA);
    expect(state.quotas[RWA_ASSET]?.balance).toBe(QUOTA_RWA);
  });

  it("rejects a non-positive amount", async () => {
    const result = await run({
      ...case_position_token,
      intent: { ...case_position_token.intent, amount: 0n },
    });
    expectPreviewError(result, "insufficientSourceBalance");
  });
});
