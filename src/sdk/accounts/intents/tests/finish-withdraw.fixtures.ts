import type { Address } from "viem";
import { MIN_INT96 } from "../../../constants/math.js";
import type {
  ClaimableWithdrawal,
  DelayedWithdrawCollateralIntent,
  OnchainSDK,
} from "../../../index.js";
import { toBN } from "../../../index.js";

import {
  ANY,
  ANY2,
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
import { POS2, WALLET } from "../testing/market.js";
import { MOCK_CLAIM_CALL } from "../testing/sdk-mock.js";
import type { CreditAccountSlice } from "../types.js";

/**
 * Withdraw tail fixtures, ported from intent-calculator
 * `withdraw.flowFixtures.ts` (tail cases only).
 */

export const WITHDRAW_UND = toBN("1000", 8);
export const WITHDRAW_ANY = toBN("2000", 18);
export const WITHDRAW_ANY2 = toBN("2000", 18);
/** Withdraw amount in rwa.asset units (8 decimals, priced 1:1 with UND). */
export const WITHDRAW_RWA = toBN("2000", 8);
export const DEBT_DELTA = toBN("4000", 8);
export const PHANTOM = "0xb1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1" as Address;

/** Per-token CA balance (legacy `A0_TOK` / und balance). */
export const A0 = toBN("100000", 18);
export const A0_UND = toBN("100000", 8);
export const QUOTA0 = toBN("50000", 8);

/** Starting account debt on the fixture CA. */
export const WITHDRAW_PRE_D = toBN("40000", 8);
/**
 * Starting TVL of the fixture CA tokens (ANY + ANY2 + UND). Claim may add
 * value when the phantom is absent from `tokens` (current fixtures).
 */
export const WITHDRAW_BASE_TV = 20_000_000_000_000n;

export const WITHDRAW_TO =
  "0x1234567890123456789012345678901234567890" as Address;

export function withdrawAmountFor(token: Address): bigint {
  if (token === UND) return WITHDRAW_UND;
  if (token === ANY) return WITHDRAW_ANY;
  return WITHDRAW_ANY2;
}

export function buildWithdrawSdk(args: {
  claimedToken: Address;
  extraPrices?: Record<Address, bigint>;
  extraDecimals?: Record<Address, number>;
  rwaAssets?: Record<Address, Address>;
}): OnchainSDK {
  return buildTailSdk(
    { claimedToken: args.claimedToken },
    {
      extraPrices: args.extraPrices,
      extraDecimals: args.extraDecimals,
      rwaAssets: args.rwaAssets,
      phantom: PHANTOM,
    },
  );
}

/** The matured withdrawal these fixtures claim. */
export function buildWithdrawClaimable(args: {
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

export function buildWithdrawFinishProps(args: {
  sourceToken: Address;
  withdrawToken: Address;
  claimedToken: Address;
  claimedAmount: bigint;
  debtRepaid: bigint;
  sdk: OnchainSDK;
  /** Overrides `withdrawAmountFor(withdrawToken)` when set. */
  withdrawAmount?: bigint;
  tokens?: CreditAccountSlice["tokens"];
  slippage?: number;
}) {
  const creditAccount: CreditAccountSlice = {
    creditAccount: CREDIT_ACCOUNT,
    creditManager: CREDIT_MANAGER,
    creditFacade: CREDIT_FACADE,
    underlying: UND,
    enabledTokensMask: 0n,
    totalDebtUSD: 0n,
    accountDebt: WITHDRAW_PRE_D,
    tokens: args.tokens ?? [
      { token: ANY, balance: A0, quota: QUOTA0, mask: 0n, success: true },
      { token: ANY2, balance: A0, quota: QUOTA0, mask: 0n, success: true },
      { token: UND, balance: A0_UND, quota: 0n, mask: 0n, success: true },
    ],
  };

  const intent: DelayedWithdrawCollateralIntent = {
    type: "WITHDRAW_COLLATERAL",
    to: WITHDRAW_TO,
    sourceToken: args.sourceToken,
    withdrawToken: args.withdrawToken,
    withdrawAmount:
      args.withdrawAmount ?? withdrawAmountFor(args.withdrawToken),
    debtRepaid: args.debtRepaid,
  };

  return {
    intent,
    creditAccount,
    sdk: args.sdk,
    quotaReserve: undefined,
    claimable: buildWithdrawClaimable(args),
    slippage: args.slippage ?? 50,
  };
}

// ---------------------------------------------------------------------------
// Test-matrix rows 4.3–4.6 tails — 10U/8U (5x) baseline, quotable phantom
// ---------------------------------------------------------------------------
//
// Self-contained on purpose: the shared helpers above claim through the
// non-quotable `PHANTOM`, which carries no quota, so tails built with them
// never emit the changeQuota op the matrix expects. These cases claim through
// `POS2` — 1:1 with `POS` and quotable — whose quota the leading half bought,
// and keep their own baseline economics: 10A of position against 8U of debt,
// with the 4.3 start having redeemed 5A (payout 1U plus repayment 4U).

const M4_LT = 9200n;
/** Quota the matrix cases give a balance: balance * LT / PERCENTAGE_FACTOR. */
const m4QuotaOf = (balance: bigint) => (balance * M4_LT) / 10000n;

/** Matrix baseline debt: 8U. */
export const M4_DEBT = 800000000n;
/** Matrix payout W: 1U. */
export const M4_W = 100000000n;
/** Proportional repayment `dD = D0 * W / C0` = 4U. */
export const M4_DD = 400000000n;
/** Payout plus repayment: 5U redeemed by the leading half. */
export const M4_SPEND = M4_W + M4_DD;
/** Quotable withdrawal phantom: `POS2`, 1:1 with `POS`. */
export const M4_PHANTOM = POS2;
/** 5U claimed in `ANY` (priced 1 against `UND` priced 2): 10 ANY. */
export const M4_CLAIM_ANY = 10000000000000000000n;
/** TVL the 4.4/4.6 tails report — the echo router credits its raw input. */
export const M4_ECHO_TVL = 10000000000000000000n;

export interface MatrixWithdrawTailCase {
  claimedToken: Address;
  claimedAmount: bigint;
  totalValue: bigint;
  ops: ExpectedFlowOp[];
  rwaAssets?: Record<Address, Address>;
}

/** The claim op every matrix tail starts with. */
function m4ClaimOp(
  claimedToken: Address,
  claimedAmount: bigint,
): ExpectedFlowOp {
  return {
    type: "claimDelayedWithdrawal",
    token: POS,
    withdrawalPhantomToken: M4_PHANTOM,
    withdrawalTokenSpent: M4_SPEND,
    outputs: [{ token: claimedToken, amount: claimedAmount, isDelayed: false }],
  };
}

/**
 * Quota op every matrix tail ends with: the phantom is fully spent, so its
 * quota is reset (the `MIN_INT96` sentinel encodes "reset" in quota deltas).
 */
function m4PhantomQuotaResetOp(): ExpectedFlowOp {
  return {
    type: "changeQuota",
    quotaIncrease: [],
    quotaDecrease: [{ token: M4_PHANTOM, balance: MIN_INT96 }],
    desiredQuota: {},
  };
}

/**
 * Matrix 4.3 tail — the claim pays `UND` directly.
 *
 * MATRIX MISMATCH: the matrix pays out first — `claim →
 * withdrawCollateral(min(W, claim.amount)) → decreaseDebt(rest) →
 * changeQuota`. The engine repays before paying out (`repay(debtRepaid,
 * keep: W)` precedes the payout leg in `planFinishWithdraw`):
 * `claim → decreaseDebt(dD) → withdrawCollateral(W) → changeQuota`.
 * Amounts are identical; only the order differs.
 */
export const case_matrix_4_3_tail: MatrixWithdrawTailCase = {
  claimedToken: UND,
  claimedAmount: M4_SPEND,
  totalValue: M4_SPEND,
  ops: [
    m4ClaimOp(UND, M4_SPEND),
    { type: "decreaseDebt", amount: M4_DD },
    { type: "withdrawCollateral", token: UND, amount: M4_W, to: WALLET },
    m4PhantomQuotaResetOp(),
  ],
};

/**
 * Matrix 4.4 tail — the claim pays `ANY`, routed into `UND` first.
 *
 * MATRIX MISMATCH: same ordering divergence as 4.3 — the matrix expects
 * `claim → swap → withdrawCollateral → decreaseDebt → changeQuota`, the
 * engine repays first:
 * `claim → swap → decreaseDebt → withdrawCollateral → changeQuota`.
 */
export const case_matrix_4_4_tail: MatrixWithdrawTailCase = {
  claimedToken: ANY,
  claimedAmount: M4_CLAIM_ANY,
  // The echoed swap output (10e18 "UND") never leaves the account beyond the
  // 5U consumed by repayment and payout, so TVL reads inflated — a known
  // artifact of the echo router on a non-1:1 pair.
  totalValue: M4_ECHO_TVL,
  ops: [
    m4ClaimOp(ANY, M4_CLAIM_ANY),
    {
      type: "swap",
      from: [{ token: ANY, balance: M4_CLAIM_ANY }],
      tokenOut: UND,
      // The mock router echoes its input amount, decimals and price unconverted.
      amountOut: M4_CLAIM_ANY,
    },
    { type: "decreaseDebt", amount: M4_DD },
    { type: "withdrawCollateral", token: UND, amount: M4_W, to: WALLET },
    m4PhantomQuotaResetOp(),
  ],
};

/**
 * Matrix 4.5 tail — 4.3 on the RWA market: unwrap before the payout.
 *
 * MATRIX MISMATCH: same ordering divergence as 4.3 — the matrix expects
 * `claim → unwrapRwaCollateral → withdrawCollateral(RWA) → decreaseDebt →
 * changeQuota`, the engine repays first:
 * `claim → decreaseDebt → unwrapRwaCollateral → withdrawCollateral(RWA) →
 * changeQuota`.
 */
export const case_matrix_4_5_tail: MatrixWithdrawTailCase = {
  claimedToken: UND,
  claimedAmount: M4_SPEND,
  totalValue: M4_SPEND,
  ops: [
    m4ClaimOp(UND, M4_SPEND),
    { type: "decreaseDebt", amount: M4_DD },
    {
      type: "unwrapRwaCollateral",
      tokenIn: UND,
      amount: M4_W,
      tokenOut: RWA_ASSET,
      amountOut: M4_W,
    },
    { type: "withdrawCollateral", token: RWA_ASSET, amount: M4_W, to: WALLET },
    m4PhantomQuotaResetOp(),
  ],
  rwaAssets: { [UND]: RWA_ASSET },
};

/**
 * Matrix 4.6 tail — 4.4 on the RWA market.
 *
 * MATRIX MISMATCH: same ordering divergence as 4.3 — the matrix expects
 * `claim → swap → unwrapRwaCollateral → withdrawCollateral(RWA) →
 * decreaseDebt → changeQuota`, the engine repays first:
 * `claim → swap → decreaseDebt → unwrapRwaCollateral →
 * withdrawCollateral(RWA) → changeQuota`.
 */
export const case_matrix_4_6_tail: MatrixWithdrawTailCase = {
  claimedToken: ANY,
  claimedAmount: M4_CLAIM_ANY,
  // Same echo-router artifact as 4.4.
  totalValue: M4_ECHO_TVL,
  ops: [
    m4ClaimOp(ANY, M4_CLAIM_ANY),
    {
      type: "swap",
      from: [{ token: ANY, balance: M4_CLAIM_ANY }],
      tokenOut: UND,
      amountOut: M4_CLAIM_ANY,
    },
    { type: "decreaseDebt", amount: M4_DD },
    {
      type: "unwrapRwaCollateral",
      tokenIn: UND,
      amount: M4_W,
      tokenOut: RWA_ASSET,
      amountOut: M4_W,
    },
    { type: "withdrawCollateral", token: RWA_ASSET, amount: M4_W, to: WALLET },
    m4PhantomQuotaResetOp(),
  ],
  rwaAssets: { [UND]: RWA_ASSET },
};

/**
 * Props for a matrix withdraw tail: the account as the 4.3 start left it —
 * 5A of position and 5A of phantom — plus the matured claim.
 */
export function buildMatrixWithdrawTailProps(c: MatrixWithdrawTailCase) {
  const creditAccount: CreditAccountSlice = {
    creditAccount: CREDIT_ACCOUNT,
    creditManager: CREDIT_MANAGER,
    creditFacade: CREDIT_FACADE,
    underlying: UND,
    enabledTokensMask: 0n,
    totalDebtUSD: 0n,
    accountDebt: M4_DEBT,
    tokens: [
      {
        token: POS,
        balance: M4_SPEND,
        quota: m4QuotaOf(M4_SPEND),
        mask: 0n,
        success: true,
      },
      {
        token: M4_PHANTOM,
        balance: M4_SPEND,
        quota: m4QuotaOf(M4_SPEND),
        mask: 0n,
        success: true,
      },
    ],
  };

  const intent: DelayedWithdrawCollateralIntent = {
    type: "WITHDRAW_COLLATERAL",
    to: WALLET,
    sourceToken: POS,
    withdrawToken: UND,
    withdrawAmount: M4_W,
    debtRepaid: M4_DD,
  };

  const claimable = {
    token: POS,
    withdrawalPhantomToken: M4_PHANTOM,
    withdrawalTokenSpent: M4_SPEND,
    outputs: [
      { token: c.claimedToken, amount: c.claimedAmount, isDelayed: false },
    ],
    claimCalls: [MOCK_CLAIM_CALL],
  } as ClaimableWithdrawal;

  return {
    intent,
    creditAccount,
    sdk: buildMarketSdk({ rwaAssets: c.rwaAssets }),
    quotaReserve: undefined,
    claimable,
    slippage: undefined,
  };
}
