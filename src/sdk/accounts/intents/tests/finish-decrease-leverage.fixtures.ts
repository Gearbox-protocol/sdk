import type { Address } from "viem";
import type {
  ClaimableWithdrawal,
  DelayedDecreaseLeverageIntent,
  OnchainSDK,
} from "../../../index.js";

import {
  ANY,
  buildTailSdk,
  CREDIT_ACCOUNT,
  CREDIT_FACADE,
  CREDIT_MANAGER,
  RWA_ASSET,
  UND,
} from "../testing/delayed.js";
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
    accountDebt: DECREASE_PRE_D,
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
