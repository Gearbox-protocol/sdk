import type { Address } from "viem";
import type { DelayedDecreaseLeverageIntent } from "../../../../model/index.js";
import { MIN_INT96 } from "../../../constants/math.js";
import type { ClaimableWithdrawal, OnchainSDK } from "../../../index.js";

import {
  ANY,
  buildMarketSdk,
  buildTailSdk,
  CREDIT_ACCOUNT,
  CREDIT_FACADE,
  CREDIT_MANAGER,
  POS,
  RWA_ASSET,
  UND,
} from "../testing/delayed.js";
import type { ExpectedFlowOp } from "../testing/expect.js";
import { POS2 } from "../testing/market.js";
import { MOCK_CLAIM_CALL } from "../testing/sdk-mock.js";
import type { CreditAccountSlice } from "../types.js";

/**
 * Decrease-leverage tail fixtures, ported from intent-calculator
 * `decreaseLeverage.flowFixtures.ts` (tail cases only).
 */

/** Repay for L0 → L1_FOUR with fixed collateral. */
export const DECREASE_REPAY = 1000000000000n;
/** CA ANY spent to fund {@link DECREASE_REPAY} (oracle: ANY@$1 → UND@$2). */
export const DECREASE_AMOUNT_S = 20000000000000000000000n;

/** Post-claim metrics after claim repay (fixed C). */
export const DECREASE_POST_T = 4000000000000n;
export const DECREASE_POST_D = 3000000000000n;

/** Pre-repay account debt (D0). */
export const DECREASE_PRE_D = DECREASE_POST_D + DECREASE_REPAY;
/** Pre-repay TVL with claim proceeds still on CA (T0). */
export const DECREASE_PRE_T = DECREASE_POST_T + DECREASE_REPAY;

export const PHANTOM = "0xb1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1" as Address;

export { ANY, RWA_ASSET, UND };

export function buildDecreaseSdk(args: {
  claimedToken: Address;
  rwaAssets?: Record<Address, Address>;
}): OnchainSDK {
  return buildTailSdk(
    { claimedToken: args.claimedToken },
    {
      rwaAssets: args.rwaAssets,
      phantom: PHANTOM,
    },
  );
}

/** The matured withdrawal these fixtures claim. */
export function buildDecreaseClaimable(args: {
  claimedToken: Address;
  claimedAmount: bigint;
}): ClaimableWithdrawal {
  return {
    token: args.claimedToken,
    withdrawalPhantomToken: PHANTOM,
    withdrawalTokenSpent: args.claimedAmount,
    outputs: [
      {
        token: args.claimedToken,
        amount: args.claimedAmount,
        isDelayed: false,
      },
    ],
    claimCalls: [MOCK_CLAIM_CALL],
  } as ClaimableWithdrawal;
}

export function buildDecreaseTailProps(args: {
  claimedToken: Address;
  claimedAmount: bigint;
  sdk: OnchainSDK;
  slippage?: number;
  /**
   * Extra CA balances besides the withdrawal phantom. Defaults so that after
   * claim the TVL equals {@link DECREASE_PRE_T} (post-repay →
   * {@link DECREASE_POST_T}).
   */
  tokens?: CreditAccountSlice["tokens"];
}) {
  const creditAccount: CreditAccountSlice = {
    creditAccount: CREDIT_ACCOUNT,
    creditManager: CREDIT_MANAGER,
    creditFacade: CREDIT_FACADE,
    underlying: UND,
    enabledTokensMask: 0n,
    totalDebtUSD: 0n,
    totalDebt: DECREASE_PRE_D,
    tokens: args.tokens ?? [
      {
        token: PHANTOM,
        balance: args.claimedAmount,
        quota: 0n,
        mask: 0n,
        success: true,
      },
      {
        // Keep a non-claimed UND balance so claim+repay lands on DECREASE_POST_T.
        // Pre-claim TVL = phantom value + this UND = DECREASE_PRE_T when
        // claimed value in UND equals DECREASE_REPAY.
        token: UND,
        balance: DECREASE_POST_T,
        quota: 0n,
        mask: 0n,
        success: true,
      },
    ],
  };

  const intent: DelayedDecreaseLeverageIntent = {
    type: "DECREASE_LEVERAGE",
  };

  return {
    intent,
    creditAccount,
    sdk: args.sdk,
    quotaReserve: undefined,
    claimable: buildDecreaseClaimable(args),
    slippage: args.slippage ?? 50,
  };
}

/** Convenience: props for a claimed token/amount. */
export function buildDecreaseOnchainTailProps(args: {
  claimedToken: Address;
  claimedAmount: bigint;
  rwaAssets?: Record<Address, Address>;
  slippage?: number;
}) {
  const sdk = buildDecreaseSdk({
    claimedToken: args.claimedToken,
    rwaAssets: args.rwaAssets,
  });
  return buildDecreaseTailProps({
    claimedToken: args.claimedToken,
    claimedAmount: args.claimedAmount,
    sdk,
    slippage: args.slippage,
  });
}

// ---------------------------------------------------------------------------
// Test-matrix rows 7.2 / 7.3 tails — 10U/8U (5x) account deleveraging to 3x
// ---------------------------------------------------------------------------
//
// Self-contained for the same reason as the withdraw matrix tails: the shared
// helpers above claim through the non-quotable `PHANTOM`, which carries no
// quota, so tails built with them never emit the changeQuota op the matrix
// expects. These cases claim through `POS2` — 1:1 with `POS` and quotable —
// whose quota the leading half bought: a delayed deleverage 5x → 3x redeems
// 4A of the 10A position to repay 4U of the 8U debt.

const M7_LT = 9200n;
/** Quota the matrix cases give a balance: balance * LT / PERCENTAGE_FACTOR. */
const m7QuotaOf = (balance: bigint) => (balance * M7_LT) / 10000n;

/** Matrix baseline debt: 8U. */
export const M7_DEBT = 800000000n;
/** Delayed deleverage 5x → 3x repays 4U. */
export const M7_DD = 400000000n;
/** Position left after the leading half redeemed 4A of the 10A. */
export const M7_POS_LEFT = 600000000n;
/** 4U claimed in `ANY` (priced 1 against `UND` priced 2): 8 ANY. */
export const M7_CLAIM_ANY = 8000000000000000000n;
/** Quotable withdrawal phantom: `POS2`, 1:1 with `POS`. */
export const M7_PHANTOM = POS2;

export interface MatrixDecreaseTailCase {
  claimedToken: Address;
  claimedAmount: bigint;
  totalValue: bigint;
  ops: ExpectedFlowOp[];
}

/** The claim op every matrix tail starts with. */
function m7ClaimOp(
  claimedToken: Address,
  claimedAmount: bigint,
): ExpectedFlowOp {
  return {
    type: "claimDelayedWithdrawal",
    token: POS,
    withdrawalPhantomToken: M7_PHANTOM,
    withdrawalTokenSpent: M7_DD,
    outputs: [{ token: claimedToken, amount: claimedAmount, isDelayed: false }],
  };
}

/**
 * Quota op every matrix tail ends with: the phantom is fully spent, so its
 * quota is reset (the `MIN_INT96` sentinel encodes "reset" in quota deltas).
 */
function m7PhantomQuotaResetOp(): ExpectedFlowOp {
  return {
    type: "changeQuota",
    quotaIncrease: [],
    quotaDecrease: [{ token: M7_PHANTOM, balance: MIN_INT96 }],
    desiredQuota: {},
  };
}

/** Matrix 7.2 tail — the claim pays `UND`; everything claimed repays the debt. */
export const case_matrix_7_2_tail: MatrixDecreaseTailCase = {
  claimedToken: UND,
  claimedAmount: M7_DD,
  totalValue: M7_POS_LEFT,
  ops: [
    m7ClaimOp(UND, M7_DD),
    { type: "decreaseDebt", amount: M7_DD },
    m7PhantomQuotaResetOp(),
  ],
};

/**
 * Matrix 7.3 tail — the claim pays `ANY`, swapped into `UND` before repaying.
 * The swap output (`amountOut`) comes from the router quote, which the spec
 * mocks to a realistic 1:1-in-value path — the echo router would otherwise
 * repay its raw input as debt (same override as case D above).
 */
export const case_matrix_7_3_tail: MatrixDecreaseTailCase = {
  claimedToken: ANY,
  claimedAmount: M7_CLAIM_ANY,
  totalValue: M7_POS_LEFT,
  ops: [
    m7ClaimOp(ANY, M7_CLAIM_ANY),
    {
      type: "swap",
      from: [{ token: ANY, balance: M7_CLAIM_ANY }],
      tokenOut: UND,
      amountOut: M7_DD,
    },
    { type: "decreaseDebt", amount: M7_DD },
    m7PhantomQuotaResetOp(),
  ],
};

/**
 * Props for a matrix decrease-leverage tail: the account as the delayed
 * deleverage to 3x left it — 6A of position and 4A of phantom — plus the
 * matured claim.
 */
export function buildMatrixDecreaseTailProps(c: MatrixDecreaseTailCase) {
  const creditAccount: CreditAccountSlice = {
    creditAccount: CREDIT_ACCOUNT,
    creditManager: CREDIT_MANAGER,
    creditFacade: CREDIT_FACADE,
    underlying: UND,
    enabledTokensMask: 0n,
    totalDebtUSD: 0n,
    totalDebt: M7_DEBT,
    tokens: [
      {
        token: POS,
        balance: M7_POS_LEFT,
        quota: m7QuotaOf(M7_POS_LEFT),
        mask: 0n,
        success: true,
      },
      {
        token: M7_PHANTOM,
        balance: M7_DD,
        quota: m7QuotaOf(M7_DD),
        mask: 0n,
        success: true,
      },
    ],
  };

  const intent: DelayedDecreaseLeverageIntent = {
    type: "DECREASE_LEVERAGE",
  };

  const claimable = {
    token: POS,
    withdrawalPhantomToken: M7_PHANTOM,
    withdrawalTokenSpent: M7_DD,
    outputs: [
      { token: c.claimedToken, amount: c.claimedAmount, isDelayed: false },
    ],
    claimCalls: [MOCK_CLAIM_CALL],
  } as ClaimableWithdrawal;

  return {
    intent,
    creditAccount,
    sdk: buildMarketSdk({}),
    quotaReserve: undefined,
    claimable,
    slippage: undefined,
  };
}
