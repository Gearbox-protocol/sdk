import { describe, expect, it } from "vitest";

import { CreditAccountOperationsService } from "../../../index.js";
import {
  assetBalance,
  expectAdjustPreview,
  expectPreviewError,
  withOnchainOpCalls,
} from "../../../testing/expect.js";
import { POS, RWA_ASSET, UND } from "../../../testing/market.js";
import {
  CA_OP_CALLS,
  MOCK_ROUTER_CALL,
  MOCK_RWA_UNWRAP_CALL,
  MOCK_RWA_WRAP_CALL,
} from "../../../testing/sdk-mock.js";
import {
  type AdjustLeverageCase,
  buildAdjustLeverageProps,
  buildAdjustLeverageSdk,
  case_decrease,
  case_decrease_from_idle_underlying,
  case_decrease_rwa,
  case_increase,
  case_increase_rwa,
  case_increase_underlying,
  case_noop,
  QUOTA_1000,
  QUOTA_1500,
  TVL_2X,
  TVL_3X,
} from "./adjust-leverage.fixtures.js";

function run(c: AdjustLeverageCase) {
  const sdk = buildAdjustLeverageSdk(c);
  const service = new CreditAccountOperationsService(sdk);
  return service.startIntent(buildAdjustLeverageProps(c, sdk));
}

function expectCase(c: AdjustLeverageCase, expectedCalls: unknown[]) {
  return async () => {
    const result = await run(c);
    return expectAdjustPreview(result, {
      totalValue: c.totalValue,
      accountDebt: c.accountDebtAfter,
      expectedOps: withOnchainOpCalls([...c.ops]),
      expectedCalls: expectedCalls as never,
    });
  };
}

describe("adjustLeverage.start — collateral fixed, debt retargeted", () => {
  it("2x → 3x: increaseDebt then swap the borrowed underlying into the position", async () => {
    const state = await expectCase(case_increase, [
      CA_OP_CALLS.increaseDebt,
      MOCK_ROUTER_CALL,
      CA_OP_CALLS.changeQuota,
    ])();

    expect(assetBalance(state.assets, POS)).toBe(TVL_3X);
    expect(assetBalance(state.assets, UND)).toBe(0n);
    expect(state.quotas[POS]?.balance).toBe(QUOTA_1500);
  });

  it("2x → 3x with underlying as the position: increaseDebt only", async () => {
    const state = await expectCase(case_increase_underlying, [
      CA_OP_CALLS.increaseDebt,
    ])();

    expect(assetBalance(state.assets, UND)).toBe(TVL_3X);
  });

  it("2x → 3x on an RWA market: unwrap instead of swap", async () => {
    const state = await expectCase(case_increase_rwa, [
      CA_OP_CALLS.increaseDebt,
      MOCK_RWA_UNWRAP_CALL,
      CA_OP_CALLS.changeQuota,
    ])();

    expect(assetBalance(state.assets, RWA_ASSET)).toBe(TVL_3X);
    expect(assetBalance(state.assets, UND)).toBe(0n);
  });

  it("3x → 2x: sell the position, then repay", async () => {
    const state = await expectCase(case_decrease, [
      MOCK_ROUTER_CALL,
      CA_OP_CALLS.decreaseDebt,
      CA_OP_CALLS.changeQuota,
    ])();

    expect(assetBalance(state.assets, POS)).toBe(TVL_2X);
    expect(assetBalance(state.assets, UND)).toBe(0n);
    expect(state.quotas[POS]?.balance).toBe(QUOTA_1000);
  });

  it("3x → 2x funded by idle underlying: no swap leg", async () => {
    const state = await expectCase(case_decrease_from_idle_underlying, [
      CA_OP_CALLS.decreaseDebt,
    ])();

    expect(assetBalance(state.assets, UND)).toBe(0n);
    expect(assetBalance(state.assets, POS)).toBe(TVL_2X);
  });

  it("3x → 2x on an RWA market: wrap instead of swap", async () => {
    const state = await expectCase(case_decrease_rwa, [
      MOCK_RWA_WRAP_CALL,
      CA_OP_CALLS.decreaseDebt,
      CA_OP_CALLS.changeQuota,
    ])();

    expect(assetBalance(state.assets, RWA_ASSET)).toBe(TVL_2X);
  });

  it("target equals current leverage → no operations", async () => {
    await expectCase(case_noop, [])();
  });

  it("rejects leverage below 1x", async () => {
    const result = await run({
      ...case_increase,
      intent: { ...case_increase.intent, targetLeverage: 50n },
    });
    expectPreviewError(result, "leverageOutOfRange");
  });

  it("rejects a target whose debt exceeds maxDebt", async () => {
    const result = await run({
      ...case_increase,
      intent: { ...case_increase.intent, targetLeverage: 50000n },
    });
    expectPreviewError(result, "debtOutOfRange");
  });

  it("rejects when no position token can be defaulted", async () => {
    const result = await run({
      ...case_increase_underlying,
      intent: {
        type: "ADJUST_LEVERAGE",
        targetLeverage: case_increase_underlying.intent.targetLeverage,
      },
    });
    expectPreviewError(result, "insufficientSourceBalance");
  });
});
