import type { Address } from "viem";
import type {
  ClaimableWithdrawal,
  DelayedWithdrawCollateralIntent,
  OnchainSDK,
  WithdrawableAsset,
} from "../../../../../index.js";
import { toBN } from "../../../../../index.js";

import type { ClaimDelayedOption } from "../../../operations/index.js";
import {
  ANY,
  ANY2,
  buildResumeSdk,
  CREDIT_ACCOUNT,
  CREDIT_FACADE,
  CREDIT_MANAGER,
  UND,
} from "../../../testing/resume.js";
import { MOCK_CLAIM_CALL } from "../../../testing/sdk-mock.js";
import type { CreditAccountSlice } from "../../../types.js";

/**
 * Resume withdraw fixtures, ported from intent-calculator
 * `withdraw.flowFixtures.ts` (resume cases only).
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
  return buildResumeSdk(
    { claimedToken: args.claimedToken },
    {
      extraPrices: args.extraPrices,
      extraDecimals: args.extraDecimals,
      rwaAssets: args.rwaAssets,
      phantom: PHANTOM,
    },
  );
}

export function buildWithdrawOffchainOptions(args: {
  claimedToken: Address;
  claimedAmount: bigint;
}): ClaimDelayedOption {
  return {
    kind: "offchain",
    phantomSpent: args.claimedAmount,
    withdrawalConfig: {
      creditManager: CREDIT_MANAGER,
      token: args.claimedToken,
      withdrawalPhantomToken: PHANTOM,
      underlying: args.claimedToken,
      withdrawalLength: 0n,
    } as WithdrawableAsset,
  };
}

export function buildWithdrawOnchainOptions(args: {
  claimedToken: Address;
  claimedAmount: bigint;
}): ClaimDelayedOption {
  return {
    kind: "onchain",
    claimableWithdrawal: {
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
    } as ClaimableWithdrawal,
  };
}

export function buildWithdrawResumeProps(args: {
  sourceToken: Address;
  withdrawToken: Address;
  claimedToken: Address;
  claimedAmount: bigint;
  debtRepaid: bigint;
  options: ClaimDelayedOption;
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
    options: args.options,
    slippage: args.slippage ?? 50,
  };
}
