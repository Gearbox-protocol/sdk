import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type { OnchainSDK } from "../../../../../index.js";

import { CreditAccountOperationsService } from "../../../index.js";
import {
  assetBalance,
  type ExpectedFlowOp,
  expectAdjustResumePreview,
} from "../../../testing/expect.js";
import type { IntentPreviewResult } from "../../../types.js";
import {
  ANY,
  buildDecreaseOffchainResumeProps,
  DECREASE_AMOUNT_S,
  DECREASE_POST_D,
  DECREASE_POST_T,
  DECREASE_REPAY,
  PHANTOM,
  RWA_ASSET,
  UND,
} from "./decrease-leverage.fixtures.js";

type DecreaseProps = ReturnType<typeof buildDecreaseOffchainResumeProps>;

function claimOp(token: Address, amount: bigint): ExpectedFlowOp {
  return {
    type: "claimDelayedWithdrawal",
    token,
    withdrawalPhantomToken: PHANTOM,
    withdrawalTokenSpent: amount,
    outputs: [{ token, amount, isDelayed: false }],
    calls: [],
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
    calls: [],
  };
}

function decreaseDebtOp(amount: bigint): ExpectedFlowOp {
  return { type: "decreaseDebt", amount, calls: [] };
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
    calls: [],
  };
}

async function runDecrease(props: DecreaseProps) {
  const service = new CreditAccountOperationsService(props.sdk as OnchainSDK);
  const result: IntentPreviewResult = await service.finishIntent(props);
  return result;
}

describe("decreaseLeverage resume — claim then repay (offchain)", () => {
  it("A (= flow 2.1): claimed und → decreaseDebt + preview state", async () => {
    const props = buildDecreaseOffchainResumeProps({
      claimedToken: UND,
      claimedAmount: DECREASE_REPAY,
    });

    const result = await runDecrease(props);

    const state = expectAdjustResumePreview(result, {
      totalValue: DECREASE_POST_T,
      accountDebt: DECREASE_POST_D,
      expectedOps: [
        claimOp(UND, DECREASE_REPAY),
        decreaseDebtOp(DECREASE_REPAY),
      ],
    });

    expect(assetBalance(state.assets, UND)).toBe(DECREASE_POST_T);
  });

  it("B (= flow 1.1): claimed und on RWA pool → same decreaseDebt tail", async () => {
    const props = buildDecreaseOffchainResumeProps({
      claimedToken: UND,
      claimedAmount: DECREASE_REPAY,
      rwaAssets: { [UND]: RWA_ASSET },
    });

    const result = await runDecrease(props);

    const state = expectAdjustResumePreview(result, {
      totalValue: DECREASE_POST_T,
      accountDebt: DECREASE_POST_D,
      expectedOps: [
        claimOp(UND, DECREASE_REPAY),
        decreaseDebtOp(DECREASE_REPAY),
      ],
    });

    expect(assetBalance(state.assets, UND)).toBe(DECREASE_POST_T);
  });

  it("C: claimed any → swap(any→und) + decreaseDebt", async () => {
    const props = buildDecreaseOffchainResumeProps({
      claimedToken: ANY,
      claimedAmount: DECREASE_AMOUNT_S,
    });

    const result = await runDecrease(props);

    const state = expectAdjustResumePreview(result, {
      totalValue: DECREASE_POST_T,
      accountDebt: DECREASE_POST_D,
      expectedOps: [
        claimOp(ANY, DECREASE_AMOUNT_S),
        swapOp(ANY, DECREASE_AMOUNT_S, UND, DECREASE_REPAY),
        decreaseDebtOp(DECREASE_REPAY),
      ],
    });

    expect(assetBalance(state.assets, ANY)).toBe(0n);
  });

  it("D: claimed rwa.asset → wrap + decreaseDebt", async () => {
    const props = buildDecreaseOffchainResumeProps({
      claimedToken: RWA_ASSET,
      claimedAmount: DECREASE_REPAY,
      rwaAssets: { [UND]: RWA_ASSET },
    });

    const result = await runDecrease(props);

    const state = expectAdjustResumePreview(result, {
      totalValue: DECREASE_POST_T,
      accountDebt: DECREASE_POST_D,
      expectedOps: [
        claimOp(RWA_ASSET, DECREASE_REPAY),
        wrapOp(RWA_ASSET, DECREASE_REPAY, UND, DECREASE_REPAY),
        decreaseDebtOp(DECREASE_REPAY),
      ],
    });

    expect(assetBalance(state.assets, RWA_ASSET)).toBe(0n);
  });
});
