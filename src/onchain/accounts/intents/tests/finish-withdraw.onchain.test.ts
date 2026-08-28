import type { Address } from "viem";
import { describe, expect, it, vi } from "vitest";
import type { OnchainSDK } from "../../../index.js";

import { CreditAccountOperationsService } from "../index.js";
import {
  ANY,
  CREDIT_FACADE,
  RWA_ASSET as RWA,
  UND,
} from "../testing/delayed.js";
import {
  type ExpectedFlowOp,
  expectAdjustPreview,
  withOnchainOpCalls,
} from "../testing/expect.js";
import {
  CA_OP_CALLS,
  MOCK_CLAIM_CALL,
  MOCK_ROUTER_CALL,
  MOCK_RWA_UNWRAP_CALL,
} from "../testing/sdk-mock.js";
import type { IntentPreviewResult } from "../types.js";
import {
  A0,
  buildMatrixWithdrawTailProps,
  buildWithdrawFinishProps,
  buildWithdrawSdk,
  case_matrix_4_3_tail,
  case_matrix_4_4_tail,
  case_matrix_4_5_tail,
  case_matrix_4_6_tail,
  DEBT_DELTA,
  M4_DD,
  type MatrixWithdrawTailCase,
  PHANTOM,
  WITHDRAW_ANY,
  WITHDRAW_PRE_D,
  WITHDRAW_RWA,
  WITHDRAW_TO,
  WITHDRAW_UND,
} from "./finish-withdraw.fixtures.js";

type WithdrawProps = ReturnType<typeof buildWithdrawFinishProps>;

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

function tailProps(args: {
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
  return buildWithdrawFinishProps({
    sourceToken: args.sourceToken,
    withdrawToken: args.withdrawToken,
    claimedToken: args.claimedToken,
    claimedAmount: args.claimedAmount,
    debtRepaid: args.debtRepaid,
    withdrawAmount: args.withdrawAmount,
    sdk,
  });
}

/**
 * Withdraw tail matrix after the withdraw-token constraint
 * (W ∈ {underlying, rwa.asset}). Swap outputs echo the mock router
 * (amountOut = amountIn); withdraw/decreaseDebt clamp against them.
 */
describe("withdraw tail S/T matrix (onchain)", () => {
  it("2.2.2 claims, swaps, and withdraws available W", async () => {
    const claimed = WITHDRAW_ANY / 2n;
    const result = await runWithdraw(
      tailProps({
        sourceToken: UND,
        withdrawToken: UND,
        claimedToken: ANY,
        claimedAmount: claimed,
        debtRepaid: 0n,
      }),
    );

    expectAdjustPreview(result, {
      // mock router echoes amountIn as UND without price conversion
      totalValue: 1_000_000_019_900_000_000_000n,
      totalDebt: WITHDRAW_PRE_D,
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
    const props = tailProps({
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
    expectAdjustPreview(result, {
      // echoed router amounts inflate TV; residual RWA after withdraw buys quota
      totalValue: 4_000_000_019_500_000_000_000n,
      totalDebt: WITHDRAW_PRE_D - DEBT_DELTA,
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
    // Both real legs keep part of their balance, so they go through the
    // many-to-one door asserted above. The one-token door is reached only by
    // their price-impact probes, which spend their whole scaled basket and so
    // have no leftover to declare.
    expect(findPath).toHaveBeenCalledTimes(2);
  });
});

/**
 * Test-matrix withdraw tails on the 10U/8U (5x) baseline, claiming through
 * the quotable phantom (`POS2`) so the trailing changeQuota is observable.
 */
describe("withdraw tail — test-matrix rows 4.3–4.6 (onchain)", () => {
  async function runMatrix(
    c: MatrixWithdrawTailCase,
  ): Promise<IntentPreviewResult> {
    const props = buildMatrixWithdrawTailProps(c);
    const service = new CreditAccountOperationsService(props.sdk as OnchainSDK);
    return service.finishIntent(props);
  }

  // MATRIX MISMATCH (see case_matrix_4_3_tail): the engine repays before paying out.
  it("matrix 4.3 tail: claim UND → decreaseDebt → withdrawCollateral → changeQuota", async () => {
    const result = await runMatrix(case_matrix_4_3_tail);

    expectAdjustPreview(result, {
      totalValue: case_matrix_4_3_tail.totalValue,
      totalDebt: M4_DD,
      expectedOps: withOnchainOpCalls([...case_matrix_4_3_tail.ops]),
      expectedCalls: [
        MOCK_CLAIM_CALL,
        CA_OP_CALLS.decreaseDebt,
        CA_OP_CALLS.withdrawCollateral,
        CA_OP_CALLS.changeQuota,
      ],
    });
  });

  // MATRIX MISMATCH (see case_matrix_4_4_tail): the engine repays before paying out.
  it("matrix 4.4 tail: claim ANY → swap → decreaseDebt → withdrawCollateral → changeQuota", async () => {
    const result = await runMatrix(case_matrix_4_4_tail);

    expectAdjustPreview(result, {
      totalValue: case_matrix_4_4_tail.totalValue,
      totalDebt: M4_DD,
      expectedOps: withOnchainOpCalls([...case_matrix_4_4_tail.ops]),
      expectedCalls: [
        MOCK_CLAIM_CALL,
        MOCK_ROUTER_CALL,
        CA_OP_CALLS.decreaseDebt,
        CA_OP_CALLS.withdrawCollateral,
        CA_OP_CALLS.changeQuota,
      ],
    });
  });

  // MATRIX MISMATCH (see case_matrix_4_5_tail): the engine repays before paying out.
  it("matrix 4.5 tail: claim UND → decreaseDebt → unwrap → withdrawCollateral(RWA) → changeQuota", async () => {
    const result = await runMatrix(case_matrix_4_5_tail);

    expectAdjustPreview(result, {
      totalValue: case_matrix_4_5_tail.totalValue,
      totalDebt: M4_DD,
      expectedOps: withOnchainOpCalls([...case_matrix_4_5_tail.ops]),
      expectedCalls: [
        MOCK_CLAIM_CALL,
        CA_OP_CALLS.decreaseDebt,
        MOCK_RWA_UNWRAP_CALL,
        CA_OP_CALLS.withdrawCollateral,
        CA_OP_CALLS.changeQuota,
      ],
    });
  });

  // MATRIX MISMATCH (see case_matrix_4_6_tail): the engine repays before paying out.
  it("matrix 4.6 tail: claim ANY → swap → decreaseDebt → unwrap → withdrawCollateral(RWA) → changeQuota", async () => {
    const result = await runMatrix(case_matrix_4_6_tail);

    expectAdjustPreview(result, {
      totalValue: case_matrix_4_6_tail.totalValue,
      totalDebt: M4_DD,
      expectedOps: withOnchainOpCalls([...case_matrix_4_6_tail.ops]),
      expectedCalls: [
        MOCK_CLAIM_CALL,
        MOCK_ROUTER_CALL,
        CA_OP_CALLS.decreaseDebt,
        MOCK_RWA_UNWRAP_CALL,
        CA_OP_CALLS.withdrawCollateral,
        CA_OP_CALLS.changeQuota,
      ],
    });
  });
});
