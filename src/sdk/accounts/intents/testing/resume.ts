import type { Address } from "viem";
import type {
  ClaimableWithdrawal,
  DelayedIntent,
  MultiCall,
  OnchainSDK,
  WithdrawableAsset,
} from "../../../index.js";
import { toBN } from "../../../index.js";

import type { ClaimDelayedOption } from "../operations/index.js";
import type { CreditAccountSlice } from "../types.js";
import type { ExpectedFlowOp } from "./expect.js";
import {
  buildMockSdk,
  MOCK_CLAIM_CALL,
  type MockQuotaEntry,
} from "./sdk-mock.js";

/**
 * Shared kit for claim-only resume fixtures (add collateral, increase
 * leverage, deposit, deposit+increase).
 *
 * Unlike the legacy props (which echoed `creditAccount.totalValue`), the
 * service computes totalValue from CA token balances via the price oracle.
 * Each case's base balance is therefore `postClaimTotalValue − claimed value
 * in UND`, so the derived totalValue matches the legacy expectation exactly.
 */

export const UND_DECIMALS = 8;
export const TOK_DECIMALS = 18;

export const UND = "0x3333333333333333333333333333333333333333" as Address;
export const ANY = "0x1111111111111111111111111111111111111111" as Address;
export const ANY2 = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as Address;
export const RWA_ASSET =
  "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as Address;
export const RESUME_FIXTURE_PHANTOM =
  "0xcccccccccccccccccccccccccccccccccccccccc" as Address;

export const CREDIT_MANAGER =
  "0xdddddddddddddddddddddddddddddddddddddddd" as Address;
export const CREDIT_FACADE =
  "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" as Address;
export const CREDIT_ACCOUNT =
  "0xacacacacacacacacacacacacacacacacacacacac" as Address;

const PRICES: Record<Address, bigint> = {
  [UND]: toBN("2", 8),
  [ANY]: toBN("1", 8),
  [ANY2]: toBN("1", 8),
  [RWA_ASSET]: toBN("2", 8),
};

const DECIMALS: Record<Address, number> = {
  [UND]: UND_DECIMALS,
  [ANY]: TOK_DECIMALS,
  [ANY2]: TOK_DECIMALS,
  [RWA_ASSET]: UND_DECIMALS,
};

const QUOTAS: Record<Address, MockQuotaEntry> = {
  [ANY]: {
    token: ANY,
    rate: 500n,
    limit: toBN("999999999999999", TOK_DECIMALS),
    isActive: true,
  },
  [ANY2]: {
    token: ANY2,
    rate: 500n,
    limit: toBN("999999999999999", TOK_DECIMALS),
    isActive: true,
  },
  [RWA_ASSET]: {
    token: RWA_ASSET,
    rate: 500n,
    limit: toBN("999999999999999", UND_DECIMALS),
    isActive: true,
  },
};

const LIQUIDATION_THRESHOLDS: Record<Address, number> = {
  [UND]: 9800,
  [ANY]: 9200,
  [ANY2]: 9200,
  [RWA_ASSET]: 9200,
};

const MAX_DEBT = toBN("200000", UND_DECIMALS);

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
  return (
    (amount * PRICES[token] * 10n ** BigInt(UND_DECIMALS)) /
    (PRICES[UND] * 10n ** BigInt(DECIMALS[token]))
  );
}

/**
 * Mock sdk for a resume case. The fixture phantom token gets the claimed
 * token's decimals so the offchain `toTargetDecimals` rescale stays identity
 * (its `10n * decimals` factor is only correct for equal decimals).
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
  return buildMockSdk({
    prices: { ...PRICES, ...extras?.extraPrices },
    decimals: {
      ...DECIMALS,
      ...extras?.extraDecimals,
      [phantom]:
        extras?.extraDecimals?.[c.claimedToken] ?? DECIMALS[c.claimedToken],
    },
    quotas: QUOTAS,
    liquidationThresholds: LIQUIDATION_THRESHOLDS,
    maxDebt: MAX_DEBT,
    creditManager: CREDIT_MANAGER,
    creditFacade: CREDIT_FACADE,
    underlying: UND,
    closePath: extras?.closePath,
    rwaAssets: extras?.rwaAssets,
  });
}

export function buildOffchainOptions(
  c: Pick<ResumeCase, "claimedToken" | "claimedAmount">,
): ClaimDelayedOption {
  return {
    kind: "offchain",
    phantomSpent: c.claimedAmount,
    withdrawalConfig: {
      creditManager: CREDIT_MANAGER,
      token: c.claimedToken,
      withdrawalPhantomToken: RESUME_FIXTURE_PHANTOM,
      underlying: c.claimedToken,
      withdrawalLength: 0n,
    } as WithdrawableAsset,
  };
}

export function buildOnchainOptions(
  c: Pick<ResumeCase, "claimedToken" | "claimedAmount">,
): ClaimDelayedOption {
  return {
    kind: "onchain",
    claimableWithdrawal: {
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
    } as ClaimableWithdrawal,
  };
}

export function buildClaimResumeProps<T extends DelayedIntent>(args: {
  intent: T;
  case: ResumeCase;
  sdk: OnchainSDK;
  options: ClaimDelayedOption;
}) {
  const { intent, case: c, sdk, options } = args;

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
    options,
    slippage: undefined,
  };
}
