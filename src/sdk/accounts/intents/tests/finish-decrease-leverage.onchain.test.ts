import type { Address } from "viem";
import { describe, expect, it, vi } from "vitest";
import type { OnchainSDK } from "../../../index.js";

import { CreditAccountOperationsService } from "../index.js";
import { CREDIT_FACADE } from "../testing/delayed.js";
import {
  assetBalance,
  type ExpectedFlowOp,
  expectAdjustPreview,
  expectCallsArrayExact,
  expectOpsArrayExact,
} from "../testing/expect.js";
import {
  CA_OP_CALLS,
  MOCK_CLAIM_CALL,
  MOCK_ROUTER_CALL,
  MOCK_RWA_WRAP_CALL,
} from "../testing/sdk-mock.js";
import type { IntentPreviewResult } from "../types.js";
import {
  ANY,
  buildDecreaseOnchainTailProps,
  DECREASE_AMOUNT_S,
  DECREASE_POST_D,
  DECREASE_POST_T,
  DECREASE_REPAY,
  PHANTOM,
  RWA_ASSET,
  UND,
} from "./finish-decrease-leverage.fixtures.js";

type DecreaseProps = ReturnType<typeof buildDecreaseOnchainTailProps>;

function claimOp(token: Address, amount: bigint): ExpectedFlowOp {
  return {
    type: "claimDelayedWithdrawal",
    token,
    withdrawalPhantomToken: PHANTOM,
    withdrawalTokenSpent: amount,
    outputs: [{ token, amount, isDelayed: false }],
    calls: [MOCK_CLAIM_CALL],
  };
}

function swapOp(
  tokenIn: Address,
  amountIn: bigint,
  tokenOut: Address,
  amountOut: bigint,
): ExpectedFlowOp {
  return {
    type: "swap",
    from: [{ token: tokenIn, balance: amountIn }],
    tokenOut,
    amountOut,
    calls: [MOCK_ROUTER_CALL],
  };
}

function decreaseDebtOp(amount: bigint): ExpectedFlowOp {
  return {
    type: "decreaseDebt",
    amount,
    calls: [CA_OP_CALLS.decreaseDebt],
  };
}

function wrapOp(
  tokenIn: Address,
  amountIn: bigint,
  tokenOut: Address,
  amountOut: bigint,
): ExpectedFlowOp {
  return {
    type: "wrapRwaCollateral",
    tokenIn,
    amount: amountIn,
    tokenOut,
    amountOut,
    calls: [MOCK_RWA_WRAP_CALL],
  };
}

function routerMocksOf(sdk: OnchainSDK) {
  const router = sdk.routerFor({ creditFacade: CREDIT_FACADE });
  return {
    findPath: vi.mocked(router.findOneTokenPath),
  };
}

async function runDecrease(props: DecreaseProps) {
  const service = new CreditAccountOperationsService(props.sdk as OnchainSDK);
  const result: IntentPreviewResult = await service.finishIntent(props);
  return result;
}

describe("decreaseLeverage tail — claim then repay (onchain)", () => {
  it("A (= flow 2.1): claimed und → decreaseDebt + preview state", async () => {
    const props = buildDecreaseOnchainTailProps({
      claimedToken: UND,
      claimedAmount: DECREASE_REPAY,
    });

    const result = await runDecrease(props);

    const state = expectAdjustPreview(result, {
      totalValue: DECREASE_POST_T,
      accountDebt: DECREASE_POST_D,
      expectedOps: [
        claimOp(UND, DECREASE_REPAY),
        decreaseDebtOp(DECREASE_REPAY),
      ],
      expectedCalls: [MOCK_CLAIM_CALL, CA_OP_CALLS.decreaseDebt],
    });

    expect(assetBalance(state.assets, UND)).toBe(DECREASE_POST_T);
  });

  it("B (= flow 1.1): claimed und on RWA pool → same decreaseDebt tail", async () => {
    const props = buildDecreaseOnchainTailProps({
      claimedToken: UND,
      claimedAmount: DECREASE_REPAY,
      rwaAssets: { [UND]: RWA_ASSET },
    });

    const result = await runDecrease(props);

    const state = expectAdjustPreview(result, {
      totalValue: DECREASE_POST_T,
      accountDebt: DECREASE_POST_D,
      expectedOps: [
        claimOp(UND, DECREASE_REPAY),
        decreaseDebtOp(DECREASE_REPAY),
      ],
      expectedCalls: [MOCK_CLAIM_CALL, CA_OP_CALLS.decreaseDebt],
    });

    expect(assetBalance(state.assets, UND)).toBe(DECREASE_POST_T);
  });

  it("C: claimed rwa.asset → wrap + decreaseDebt", async () => {
    const props = buildDecreaseOnchainTailProps({
      claimedToken: RWA_ASSET,
      claimedAmount: DECREASE_REPAY,
      rwaAssets: { [UND]: RWA_ASSET },
    });

    const result = await runDecrease(props);

    const state = expectAdjustPreview(result, {
      totalValue: DECREASE_POST_T,
      accountDebt: DECREASE_POST_D,
      expectedOps: [
        claimOp(RWA_ASSET, DECREASE_REPAY),
        wrapOp(RWA_ASSET, DECREASE_REPAY, UND, DECREASE_REPAY),
        decreaseDebtOp(DECREASE_REPAY),
      ],
      expectedCalls: [
        MOCK_CLAIM_CALL,
        MOCK_RWA_WRAP_CALL,
        CA_OP_CALLS.decreaseDebt,
      ],
    });

    expect(assetBalance(state.assets, RWA_ASSET)).toBe(0n);
  });

  it("D: claimed any → swap(any→und) + decreaseDebt", async () => {
    const props = buildDecreaseOnchainTailProps({
      claimedToken: ANY,
      claimedAmount: DECREASE_AMOUNT_S,
    });
    const { findPath } = routerMocksOf(props.sdk as OnchainSDK);
    findPath.mockResolvedValue({
      amount: DECREASE_REPAY,
      minAmount: DECREASE_REPAY,
      calls: [MOCK_ROUTER_CALL],
    });

    const result = await runDecrease(props);

    const state = expectAdjustPreview(result, {
      totalValue: DECREASE_POST_T,
      accountDebt: DECREASE_POST_D,
      expectedOps: [
        claimOp(ANY, DECREASE_AMOUNT_S),
        swapOp(ANY, DECREASE_AMOUNT_S, UND, DECREASE_REPAY),
        decreaseDebtOp(DECREASE_REPAY),
      ],
      expectedCalls: [
        MOCK_CLAIM_CALL,
        MOCK_ROUTER_CALL,
        CA_OP_CALLS.decreaseDebt,
      ],
    });

    expect(assetBalance(state.assets, ANY)).toBe(0n);
    expect(findPath).toHaveBeenCalledTimes(1);
  });

  it("D.slippage: decreaseDebt and swap use swap minOut", async () => {
    const undAvg = DECREASE_REPAY;
    const undMin = undAvg - 10_000_000_000n;

    const props = buildDecreaseOnchainTailProps({
      claimedToken: ANY,
      claimedAmount: DECREASE_AMOUNT_S,
    });
    const { findPath } = routerMocksOf(props.sdk as OnchainSDK);
    findPath.mockResolvedValue({
      amount: undAvg,
      minAmount: undMin,
      calls: [MOCK_ROUTER_CALL],
    });

    const result = await runDecrease(props);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("expected ok decrease preview");
    }

    expectOpsArrayExact(
      result.operations.filter(op => op.type !== "changeQuota"),
      [
        claimOp(ANY, DECREASE_AMOUNT_S),
        swapOp(ANY, DECREASE_AMOUNT_S, UND, undMin),
        decreaseDebtOp(undMin),
      ],
    );
    expectCallsArrayExact(result.calls, [
      MOCK_CLAIM_CALL,
      MOCK_ROUTER_CALL,
      CA_OP_CALLS.decreaseDebt,
    ]);
  });
});
