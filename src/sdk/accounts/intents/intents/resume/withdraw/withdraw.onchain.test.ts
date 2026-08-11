import type { Address } from "viem";
import { describe, expect, it, vi } from "vitest";
import type { OnchainSDK } from "../../../../../index.js";

import { CreditAccountOperationsService } from "../../../index.js";
import {
  type ExpectedFlowOp,
  expectAdjustResumePreview,
} from "../../../testing/expect.js";
import {
  ANY,
  CREDIT_FACADE,
  RWA_ASSET as RWA,
  UND,
} from "../../../testing/resume.js";
import {
  CA_OP_CALLS,
  MOCK_CLAIM_CALL,
  MOCK_ROUTER_CALL,
} from "../../../testing/sdk-mock.js";
import type { IntentPreviewResult } from "../../../types.js";
import {
  A0,
  buildWithdrawOnchainOptions,
  buildWithdrawResumeProps,
  buildWithdrawSdk,
  DEBT_DELTA,
  PHANTOM,
  WITHDRAW_ANY,
  WITHDRAW_PRE_D,
  WITHDRAW_RWA,
  WITHDRAW_TO,
  WITHDRAW_UND,
} from "./withdraw.fixtures.js";

type WithdrawProps = ReturnType<typeof buildWithdrawResumeProps>;

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

function routerMocksOf(sdk: OnchainSDK) {
  const router = sdk.routerFor({ creditFacade: CREDIT_FACADE });
  return {
    findPath: vi.mocked(router.findOneTokenPath),
    findMany: vi.mocked(router.findManyToOnePath),
  };
}

async function runWithdraw(props: WithdrawProps): Promise<IntentPreviewResult> {
  const service = new CreditAccountOperationsService(props.sdk as OnchainSDK);
  return service.finishIntent(props);
}

function resumeProps(args: {
  sourceToken: Address;
  withdrawToken: Address;
  claimedToken: Address;
  claimedAmount: bigint;
  debtRepaid: bigint;
  withdrawAmount?: bigint;
  sdkExtras?: Parameters<typeof buildWithdrawSdk>[0];
}): WithdrawProps {
  const sdk = buildWithdrawSdk({
    claimedToken: args.claimedToken,
    ...args.sdkExtras,
  });
  return buildWithdrawResumeProps({
    sourceToken: args.sourceToken,
    withdrawToken: args.withdrawToken,
    claimedToken: args.claimedToken,
    claimedAmount: args.claimedAmount,
    debtRepaid: args.debtRepaid,
    withdrawAmount: args.withdrawAmount,
    options: buildWithdrawOnchainOptions({
      claimedToken: args.claimedToken,
      claimedAmount: args.claimedAmount,
    }),
    sdk,
  });
}

/**
 * Withdraw resume matrix after the withdraw-token constraint
 * (W ∈ {underlying, rwa.asset}). Swap outputs echo the mock router
 * (amountOut = amountIn); withdraw/decreaseDebt clamp against them.
 */
describe("withdraw resume S/T matrix (onchain)", () => {
  it("2.2.2 claims, swaps, and withdraws available W", async () => {
    const claimed = WITHDRAW_ANY / 2n;
    const result = await runWithdraw(
      resumeProps({
        sourceToken: UND,
        withdrawToken: UND,
        claimedToken: ANY,
        claimedAmount: claimed,
        debtRepaid: 0n,
      }),
    );

    expectAdjustResumePreview(result, {
      // mock router echoes amountIn as UND without price conversion
      totalValue: 1_000_000_019_900_000_000_000n,
      accountDebt: WITHDRAW_PRE_D,
      expectedOps: [
        claimOp(ANY, claimed),
        // mock router echoes the spent amount (expected − leftover)
        swapOp(ANY, claimed, UND, claimed),
        // min(W=1000e8, echoed 1000e18)
        {
          type: "withdrawCollateral",
          token: UND,
          amount: WITHDRAW_UND,
          to: WITHDRAW_TO,
          calls: [CA_OP_CALLS.withdrawCollateral],
        },
      ],
      expectedCalls: [
        MOCK_CLAIM_CALL,
        MOCK_ROUTER_CALL,
        CA_OP_CALLS.withdrawCollateral,
      ],
    });
  });

  it("2.4.3 keeps W-first split call order (W = rwa.asset)", async () => {
    const claimed = 2n * WITHDRAW_ANY;
    const withdrawW = WITHDRAW_RWA / 2n;
    const props = resumeProps({
      sourceToken: ANY,
      withdrawToken: RWA,
      claimedToken: ANY,
      claimedAmount: claimed,
      debtRepaid: DEBT_DELTA,
      withdrawAmount: withdrawW,
      sdkExtras: {
        claimedToken: ANY,
        rwaAssets: { [UND]: RWA },
      },
    });
    const { findPath, findMany } = routerMocksOf(props.sdk as OnchainSDK);
    const result = await runWithdraw(props);

    // Oracle split: W(1000e8 RWA) → 2000e18 ANY; claim splits 50/50.
    const wInClaim = WITHDRAW_ANY;
    expectAdjustResumePreview(result, {
      // echoed router amounts inflate TV; residual RWA after withdraw buys quota
      totalValue: 4_000_000_019_500_000_000_000n,
      accountDebt: WITHDRAW_PRE_D - DEBT_DELTA,
      expectedOps: [
        claimOp(ANY, claimed),
        // debt leg: mock router echoes the spent amount
        swapOp(ANY, claimed - wInClaim, UND, claimed - wInClaim),
        // min(echoed 2000e18, dD=4000e8)
        {
          type: "decreaseDebt",
          amount: DEBT_DELTA,
          calls: [CA_OP_CALLS.decreaseDebt],
        },
        swapOp(ANY, wInClaim, RWA, wInClaim),
        // min(W=1000e8, echoed 2000e18)
        {
          type: "withdrawCollateral",
          token: RWA,
          amount: withdrawW,
          to: WITHDRAW_TO,
          calls: [CA_OP_CALLS.withdrawCollateral],
        },
        {
          type: "changeQuota",
          quotaIncrease: [{ token: RWA, balance: 30_000_000_000_000n }],
          quotaDecrease: [],
          desiredQuota: {},
          calls: [CA_OP_CALLS.changeQuota],
        },
      ],
      expectedCalls: [
        MOCK_CLAIM_CALL,
        MOCK_ROUTER_CALL,
        CA_OP_CALLS.decreaseDebt,
        MOCK_ROUTER_CALL,
        CA_OP_CALLS.withdrawCollateral,
        CA_OP_CALLS.changeQuota,
      ],
    });
    expect(findMany).toHaveBeenCalledTimes(2);
    expect(findMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        expectedBalances: [{ token: ANY, balance: A0 + claimed }],
        leftoverBalances: [{ token: ANY, balance: A0 + wInClaim }],
        target: UND,
      }),
    );
    expect(findMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        expectedBalances: [{ token: ANY, balance: A0 + wInClaim }],
        leftoverBalances: [{ token: ANY, balance: A0 }],
        target: RWA,
      }),
    );
    expect(findPath).not.toHaveBeenCalled();
  });
});
