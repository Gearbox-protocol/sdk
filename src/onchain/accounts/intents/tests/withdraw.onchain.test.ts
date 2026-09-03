import { describe, expect, it } from "vitest";

import { CreditAccountOperationsService } from "../index.js";
import {
  assetBalance,
  expectAdjustPreview,
  expectPreviewError,
  withOnchainOpCalls,
} from "../testing/expect.js";
import { POS, POS2, UND, WALLET } from "../testing/market.js";
import {
  CA_OP_CALLS,
  MOCK_ROUTER_CALL,
  MOCK_RWA_UNWRAP_CALL,
} from "../testing/sdk-mock.js";
import {
  buildWithdrawProps,
  buildWithdrawSdk,
  case_matrix_4_1,
  case_matrix_4_2,
  case_pos_pos,
  case_pos_pos2,
  case_pos_und,
  case_rwa_pos_und,
  case_und_pos,
  case_und_und,
  DEBT_AFTER,
  M4_SPEND,
  M4_W,
  TVL_AFTER,
  W,
  type WithdrawCase,
} from "./withdraw.fixtures.js";

function run(c: WithdrawCase) {
  const sdk = buildWithdrawSdk(c);
  const service = new CreditAccountOperationsService(sdk);
  return service.startIntent(buildWithdrawProps(c, sdk));
}

async function expectCase(c: WithdrawCase, expectedCalls: unknown[]) {
  const result = await run(c);
  return expectAdjustPreview(result, {
    totalValue: c.totalValue,
    totalDebt: c.totalDebtAfter,
    expectedOps: withOnchainOpCalls([...c.ops]),
    expectedCalls: expectedCalls as never,
  });
}

describe("withdraw.start — partial exit at fixed leverage", () => {
  it("S=U, T=U: decreaseDebt then withdraw", async () => {
    const state = await expectCase(case_und_und, [
      CA_OP_CALLS.decreaseDebt,
      CA_OP_CALLS.withdrawCollateral,
    ]);

    expect(assetBalance(state.assets, UND)).toBe(TVL_AFTER);
    // Leverage held: TVL 1800 on collateral 900.
    expect(state.totalValue.value - state.totalDebt.value).toBe(DEBT_AFTER);
  });

  it("S=U, T=POS: repay, route the withdrawal, withdraw it", async () => {
    const state = await expectCase(case_und_pos, [
      CA_OP_CALLS.decreaseDebt,
      MOCK_ROUTER_CALL,
      CA_OP_CALLS.withdrawCollateral,
    ]);

    expect(assetBalance(state.assets, UND)).toBe(TVL_AFTER);
    expect(assetBalance(state.assets, POS)).toBe(0n);
  });

  it("S=POS, T=U: a single swap funds both the withdrawal and the repayment", async () => {
    const state = await expectCase(case_pos_und, [
      MOCK_ROUTER_CALL,
      CA_OP_CALLS.decreaseDebt,
      CA_OP_CALLS.withdrawCollateral,
      CA_OP_CALLS.changeQuota,
    ]);

    expect(assetBalance(state.assets, POS)).toBe(TVL_AFTER);
    expect(assetBalance(state.assets, UND)).toBe(0n);
  });

  it("S=T=POS: only the repayment is routed, the withdrawal goes out as-is", async () => {
    const state = await expectCase(case_pos_pos, [
      MOCK_ROUTER_CALL,
      CA_OP_CALLS.decreaseDebt,
      CA_OP_CALLS.withdrawCollateral,
      CA_OP_CALLS.changeQuota,
    ]);

    expect(assetBalance(state.assets, POS)).toBe(TVL_AFTER);
  });

  it("S=POS, T=POS2: two independent legs, withdrawal shortfall does not touch debt", async () => {
    const state = await expectCase(case_pos_pos2, [
      MOCK_ROUTER_CALL,
      CA_OP_CALLS.decreaseDebt,
      MOCK_ROUTER_CALL,
      CA_OP_CALLS.withdrawCollateral,
      CA_OP_CALLS.changeQuota,
    ]);

    expect(assetBalance(state.assets, POS)).toBe(TVL_AFTER);
    expect(assetBalance(state.assets, POS2)).toBe(0n);
  });

  it("RWA market: the underlying withdrawal is force-unwrapped to the asset", async () => {
    await expectCase(case_rwa_pos_und, [
      MOCK_ROUTER_CALL,
      CA_OP_CALLS.decreaseDebt,
      MOCK_RWA_UNWRAP_CALL,
      CA_OP_CALLS.withdrawCollateral,
      CA_OP_CALLS.changeQuota,
    ]);
  });

  it("defaults the source to the fattest balance", async () => {
    const result = await run({
      ...case_pos_und,
      intent: { type: "WITHDRAW", amount: W, to: WALLET },
    });
    expectAdjustPreview(result, {
      totalValue: case_pos_und.totalValue,
      totalDebt: case_pos_und.totalDebtAfter,
      expectedOps: withOnchainOpCalls([...case_pos_und.ops]),
      expectedCalls: [
        MOCK_ROUTER_CALL,
        CA_OP_CALLS.decreaseDebt,
        CA_OP_CALLS.withdrawCollateral,
        CA_OP_CALLS.changeQuota,
      ],
    });
  });

  it("names the withdrawal: a partial withdrawal cannot empty the balance", async () => {
    const result = await run(case_und_und);
    if (!result.ok)
      throw new Error(`expected a preview, got ${result.error.code}`);

    const paid = result.operations.find(op => op.type === "withdrawCollateral");
    expect(paid?.type === "withdrawCollateral" && paid.all).toBeUndefined();
  });

  it("rejects an account whose net value the debt has already eaten", async () => {
    const result = await run({
      ...case_und_und,
      totalDebt: 200000000000n,
    });
    expectPreviewError(result, "insufficientBalance");
  });

  it("rejects a source that cannot cover withdrawal plus repayment", async () => {
    const result = await run({
      ...case_pos_und,
      tokens: [
        { token: POS, balance: W, quota: 0n, mask: 0n, success: true },
        {
          token: UND,
          balance: 190000000000n,
          quota: 0n,
          mask: 0n,
          success: true,
        },
      ],
    });
    expectPreviewError(result, "insufficientBalance");
  });

  it("rejects a non-positive amount", async () => {
    const result = await run({
      ...case_und_und,
      intent: { ...case_und_und.intent, amount: 0n },
    });
    expectPreviewError(result, "insufficientBalance");
  });
});

describe("withdraw.start — test-matrix rows 4.1/4.2 (10U/8U at 5x)", () => {
  // MATRIX MISMATCH (see case_matrix_4_1): the engine repays before withdrawing.
  it("matrix 4.1: swap → decreaseDebt → withdrawCollateral → changeQuota, leverage held at 5x", async () => {
    const state = await expectCase(case_matrix_4_1, [
      MOCK_ROUTER_CALL,
      CA_OP_CALLS.decreaseDebt,
      CA_OP_CALLS.withdrawCollateral,
      CA_OP_CALLS.changeQuota,
    ]);

    expect(assetBalance(state.assets, POS)).toBe(M4_SPEND);
    // TVL 5U against debt 4U leaves collateral at 1U: still 5x.
    expect(state.totalValue.value - state.totalDebt.value).toBe(M4_W);
  });

  // MATRIX MISMATCH (see case_matrix_4_2): the engine repays before withdrawing.
  it("matrix 4.2: same on an RWA market, withdrawal unwrapped on the way out", async () => {
    await expectCase(case_matrix_4_2, [
      MOCK_ROUTER_CALL,
      CA_OP_CALLS.decreaseDebt,
      MOCK_RWA_UNWRAP_CALL,
      CA_OP_CALLS.withdrawCollateral,
      CA_OP_CALLS.changeQuota,
    ]);
  });
});
