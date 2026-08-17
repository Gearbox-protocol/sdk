import type { Address } from "viem";
import type {
  ClaimableWithdrawal,
  DelayedIntent,
  MultiCall,
  OnchainSDK,
} from "../../../index.js";
import type { CreditAccountSlice } from "../types.js";
import type { ExpectedFlowOp } from "./expect.js";
import {
  buildMarketSdk,
  CREDIT_ACCOUNT,
  CREDIT_FACADE,
  CREDIT_MANAGER,
  DECIMALS,
  UND,
  valueInUnd,
} from "./market.js";
import { MOCK_CLAIM_CALL } from "./sdk-mock.js";

export {
  ANY,
  ANY2,
  buildMarketSdk,
  CREDIT_ACCOUNT,
  CREDIT_FACADE,
  CREDIT_MANAGER,
  RWA_ASSET,
  TOK_DECIMALS,
  UND,
  UND_DECIMALS,
} from "./market.js";

/**
 * Shared kit for claim-only resume fixtures (add collateral, increase
 * leverage, deposit, deposit+increase).
 *
 * Unlike the legacy props (which echoed `creditAccount.totalValue`), the
 * service computes totalValue from CA token balances via the price oracle.
 * Each case's base balance is therefore `postClaimTotalValue − claimed value
 * in UND`, so the derived totalValue matches the legacy expectation exactly.
 */

export const RESUME_FIXTURE_PHANTOM =
  "0xcccccccccccccccccccccccccccccccccccccccc" as Address;

export interface ResumeCase {
  claimedToken: Address;
  claimedAmount: bigint;
  postClaimTotalValue: bigint;
  postClaimDebt: bigint;
  resumeOps: ExpectedFlowOp[];
  expectedQuotaBalance?: bigint;
  /**
   * Pre-existing CA balances besides the withdrawal phantom. Defaults to
   * `postClaimTotalValue − claimed value` in UND. Cases claiming UND override
   * it with another token so the claimed balance stays distinguishable.
   */
  baseAssets?: CreditAccountSlice["tokens"];
}

/** Claimed proceeds converted to UND (mirrors the mock price oracle). */
export function claimedValueInUnd(amount: bigint, token: Address): bigint {
  return valueInUnd(amount, token);
}

/**
 * Mock sdk for a resume case. The fixture phantom token gets the claimed token's
 * decimals, so any 1:1 rescale through it stays the identity.
 * `closePath` configures the router `findBestClosePath` result (close resume).
 */
export function buildResumeSdk(
  c: Pick<ResumeCase, "claimedToken">,
  extras?: {
    closePath?: {
      amount: bigint;
      minAmount: bigint;
      underlyingBalance: bigint;
      calls: MultiCall[];
    };
    /** RWA markets: underlying → rwa.asset (tokensMeta.rwaUnderlyings). */
    rwaAssets?: Record<Address, Address>;
    /** Additional / overriding token prices (PRICE_DECIMALS_POW-scaled). */
    extraPrices?: Record<Address, bigint>;
    /** Additional / overriding token decimals. */
    extraDecimals?: Record<Address, number>;
    /** Withdrawal phantom address (defaults to RESUME_FIXTURE_PHANTOM). */
    phantom?: Address;
  },
): OnchainSDK {
  const phantom = extras?.phantom ?? RESUME_FIXTURE_PHANTOM;
  return buildMarketSdk({
    ...extras,
    extraDecimals: {
      ...extras?.extraDecimals,
      [phantom]:
        extras?.extraDecimals?.[c.claimedToken] ?? DECIMALS[c.claimedToken],
    },
  });
}

/** The matured withdrawal a resume case claims. */
export function buildClaimable(
  c: Pick<ResumeCase, "claimedToken" | "claimedAmount">,
): ClaimableWithdrawal {
  return {
    token: c.claimedToken,
    withdrawalPhantomToken: RESUME_FIXTURE_PHANTOM,
    withdrawalTokenSpent: c.claimedAmount,
    outputs: [
      {
        token: c.claimedToken,
        amount: c.claimedAmount,
        isDelayed: false,
      },
    ],
    claimCalls: [MOCK_CLAIM_CALL],
  } as ClaimableWithdrawal;
}

export function buildClaimResumeProps<T extends DelayedIntent>(args: {
  intent: T;
  case: ResumeCase;
  sdk: OnchainSDK;
}) {
  const { intent, case: c, sdk } = args;

  const creditAccount: CreditAccountSlice = {
    creditAccount: CREDIT_ACCOUNT,
    creditManager: CREDIT_MANAGER,
    creditFacade: CREDIT_FACADE,
    underlying: UND,
    enabledTokensMask: 0n,
    totalDebtUSD: 0n,
    accountDebt: c.postClaimDebt,
    tokens: [
      {
        token: RESUME_FIXTURE_PHANTOM,
        balance: c.claimedAmount,
        quota: 0n,
        mask: 0n,
        success: true,
      },
      ...(c.baseAssets ?? [
        {
          token: UND,
          balance:
            c.postClaimTotalValue -
            claimedValueInUnd(c.claimedAmount, c.claimedToken),
          quota: 0n,
          mask: 0n,
          success: true,
        },
      ]),
    ],
  };

  return {
    intent,
    creditAccount,
    sdk,
    quotaReserve: undefined,
    claimable: buildClaimable(c),
    slippage: undefined,
  };
}
