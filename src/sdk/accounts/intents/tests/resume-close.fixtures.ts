import type { Address } from "viem";
import type { DelayedCloseAccountIntent, OnchainSDK } from "../../../index.js";
import { toBN } from "../../../index.js";

import type { ExpectedFlowOp } from "../testing/expect.js";
import {
  ANY,
  buildClaimable,
  buildResumeSdk,
  CREDIT_ACCOUNT,
  CREDIT_FACADE,
  CREDIT_MANAGER,
  claimedValueInUnd,
  RESUME_FIXTURE_PHANTOM,
  RWA_ASSET,
  UND,
} from "../testing/resume.js";
import type { CloseState, CreditAccountSlice } from "../types.js";

/**
 * Resume close fixtures, ported from intent-calculator
 * `closeAccount.flowFixtures.ts` (resume cases only).
 *
 * The oracle quoter repays debt from NON-underlying value
 * (`amount = Σ convert(non-underlying) − debt`), so the base balance is held
 * in TOK worth `CLOSE_T0` (minus the claimed token's value when the claim
 * adds convertible value) and the derived amount matches `CLOSE_EQUITY`.
 */

export const CLOSE_T0 = 5_000_000_000_000n;
export const CLOSE_D0 = 4_000_000_000_000n;
export const CLOSE_EQUITY = 1000000000000n;
export const CLAIMED = 1_000_000n;
export const A0_TOK = toBN("100000", 18);

/** TOK worth CLOSE_T0 (TOK $1 vs UND $2, 18→8 decimals). */
const BASE_TOK = toBN("100000", 18);

/** Wallet recipient of the close withdraw (legacy `mockAccount`). */
export const CLOSE_TO = "0x1234567890123456789012345678901234567890" as Address;

export const rwaUnderlyingMeta = { asset: RWA_ASSET };

/** Resume: claim first, then same close op as full flow. */
export const closeResumeOps: ExpectedFlowOp[] = [
  {
    type: "claimDelayedWithdrawal",
    token: UND,
    withdrawalPhantomToken: RESUME_FIXTURE_PHANTOM,
    withdrawalTokenSpent: 0n,
    outputs: [{ token: UND, amount: 0n, isDelayed: false }],
    calls: [],
  },
  {
    type: "closeCreditAccount",
    amount: CLOSE_EQUITY,
    minAmount: CLOSE_EQUITY,
    underlyingBalance: CLOSE_EQUITY,
    calls: [],
  },
];

export const closePreviewState: CloseState = {
  kind: "close",
  amount: CLOSE_EQUITY,
  minAmount: CLOSE_EQUITY,
  underlyingBalance: CLOSE_EQUITY,
};

export { buildClaimable, CREDIT_ACCOUNT };

export function buildCloseSdk(args: {
  claimedToken: Address;
  closePath?: {
    amount: bigint;
    minAmount: bigint;
    underlyingBalance: bigint;
    calls: Array<{ target: Address; callData: `0x${string}` }>;
  };
  rwaAssets?: Record<Address, Address>;
}): OnchainSDK {
  return buildResumeSdk(
    { claimedToken: args.claimedToken },
    { closePath: args.closePath, rwaAssets: args.rwaAssets },
  );
}

/** Pre-claim CA for resume: phantom balance; claim op credits claimed token then close. */
export function buildCloseResumeProps(args: {
  sdk: OnchainSDK;
  claimedToken?: Address;
  claimedAmount?: bigint;
  tokens?: CreditAccountSlice["tokens"];
  slippage?: number;
}) {
  const claimedToken = args.claimedToken ?? UND;
  const claimedAmount = args.claimedAmount ?? 0n;

  const creditAccount: CreditAccountSlice = {
    creditAccount: CREDIT_ACCOUNT,
    creditManager: CREDIT_MANAGER,
    creditFacade: CREDIT_FACADE,
    underlying: UND,
    enabledTokensMask: 0n,
    totalDebtUSD: 0n,
    accountDebt: CLOSE_D0,
    tokens: args.tokens ?? [
      {
        token: RESUME_FIXTURE_PHANTOM,
        balance: claimedAmount,
        quota: 0n,
        mask: 0n,
        success: true,
      },
      {
        token: ANY,
        // Claimed UND goes to wallet (not to debt repay); other claimed
        // tokens add convertible value, so their value is deducted from base.
        balance:
          claimedToken === UND
            ? BASE_TOK
            : BASE_TOK -
              claimedValueInUnd(claimedAmount, claimedToken) * 20_000_000_000n,
        quota: 0n,
        mask: 0n,
        success: true,
      },
    ],
  };

  return {
    intent: {
      type: "CLOSE_ACCOUNT",
      to: CLOSE_TO,
    } as DelayedCloseAccountIntent,
    creditAccount,
    sdk: args.sdk,
    quotaReserve: undefined,
    claimable: buildClaimable({ claimedToken, claimedAmount }),
    slippage: args.slippage ?? 50,
  };
}
