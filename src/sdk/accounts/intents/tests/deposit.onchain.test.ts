import { describe, expect, it } from "vitest";

import { CreditAccountOperationsService } from "../index.js";
import {
  assetBalance,
  expectAdjustPreview,
  expectPreviewError,
  withOnchainOpCalls,
} from "../testing/expect.js";
import { POS, RWA_ASSET, UND } from "../testing/market.js";
import {
  CA_OP_CALLS,
  MOCK_ROUTER_CALL,
  MOCK_RWA_UNWRAP_CALL,
  MOCK_RWA_WRAP_CALL,
} from "../testing/sdk-mock.js";
import {
  buildDepositProps,
  buildDepositSdk,
  case_fixed_leverage,
  case_position_is_underlying,
  case_rwa_collateral,
  case_rwa_position,
  case_target_leverage,
  type DepositCase,
  P2000,
  P3000,
  QUOTA_2000,
  QUOTA_3000,
} from "./deposit.fixtures.js";

function run(c: DepositCase) {
  const sdk = buildDepositSdk(c);
  const service = new CreditAccountOperationsService(sdk);
  return service.startIntent(buildDepositProps(c, sdk));
}

async function expectCase(c: DepositCase, expectedCalls: unknown[]) {
  const result = await run(c);
  return expectAdjustPreview(result, {
    totalValue: c.totalValue,
    accountDebt: c.accountDebtAfter,
    expectedOps: withOnchainOpCalls([...c.ops]),
    expectedCalls: expectedCalls as never,
  });
}

describe("deposit.start — collateral in, debt on top, converted to position", () => {
  it("1.1 preserves leverage: addCollateral → increaseDebt → swap", async () => {
    const state = await expectCase(case_fixed_leverage, [
      CA_OP_CALLS.addCollateral,
      CA_OP_CALLS.increaseDebt,
      MOCK_ROUTER_CALL,
      CA_OP_CALLS.changeQuota,
    ]);

    expect(assetBalance(state.assets, POS)).toBe(P2000);
    expect(assetBalance(state.assets, UND)).toBe(0n);
    expect(state.quotas[POS]?.balance).toBe(QUOTA_2000);
    // TVL 2000 against debt 1000 leaves collateral at 1000: still 2x.
    expect(state.totalValue - state.accountDebt).toBe(state.accountDebt);
  });

  it("1.2 levers up to the target while depositing", async () => {
    const state = await expectCase(case_target_leverage, [
      CA_OP_CALLS.addCollateral,
      CA_OP_CALLS.increaseDebt,
      MOCK_ROUTER_CALL,
      CA_OP_CALLS.changeQuota,
    ]);

    expect(assetBalance(state.assets, POS)).toBe(P3000);
    expect(state.quotas[POS]?.balance).toBe(QUOTA_3000);
    // TVL 3000 on collateral 1000 is exactly 3x.
    expect(state.totalValue).toBe(P3000);
  });

  it("skips the swap when the position token is the underlying", async () => {
    const state = await expectCase(case_position_is_underlying, [
      CA_OP_CALLS.addCollateral,
      CA_OP_CALLS.increaseDebt,
    ]);

    expect(assetBalance(state.assets, UND)).toBe(P2000);
  });

  it("wraps the RWA asset before routing it", async () => {
    const state = await expectCase(case_rwa_collateral, [
      CA_OP_CALLS.addCollateral,
      MOCK_RWA_WRAP_CALL,
      CA_OP_CALLS.increaseDebt,
      MOCK_ROUTER_CALL,
      CA_OP_CALLS.changeQuota,
    ]);

    expect(assetBalance(state.assets, POS)).toBe(P2000);
    expect(assetBalance(state.assets, RWA_ASSET)).toBe(0n);
  });

  it("leaves the deposit alone and unwraps only the debt when the asset is the position", async () => {
    const state = await expectCase(case_rwa_position, [
      CA_OP_CALLS.addCollateral,
      CA_OP_CALLS.increaseDebt,
      MOCK_RWA_UNWRAP_CALL,
      CA_OP_CALLS.changeQuota,
    ]);

    expect(assetBalance(state.assets, RWA_ASSET)).toBe(P2000);
    expect(assetBalance(state.assets, UND)).toBe(0n);
  });

  it("rejects a collateral token that is not the underlying", async () => {
    const result = await run({
      ...case_fixed_leverage,
      intent: { ...case_fixed_leverage.intent, token: POS },
    });
    expectPreviewError(result, "unsupportedCollateralToken");
  });

  it("rejects a target leverage that would require repaying", async () => {
    const result = await run({
      ...case_target_leverage,
      intent: { ...case_target_leverage.intent, targetLeverage: 100n },
    });
    expectPreviewError(result, "leverageOutOfRange");
  });

  it("rejects a non-positive amount", async () => {
    const result = await run({
      ...case_fixed_leverage,
      intent: { ...case_fixed_leverage.intent, amount: 0n },
    });
    expectPreviewError(result, "insufficientSourceBalance");
  });
});
