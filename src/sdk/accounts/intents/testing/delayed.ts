import type { Address } from "viem";
import type { ClaimableWithdrawal, OnchainSDK } from "../../../index.js";
import type { CreditAccountSlice, ResumableIntent } from "../types.js";
import type { ExpectedFlowOp } from "./expect.js";
import {
  buildMarketSdk,
  CREDIT_ACCOUNT,
  CREDIT_FACADE,
  CREDIT_MANAGER,
  DECIMALS,
  type MarketSdkExtras,
  UND,
  valueInUnd,
} from "./market.js";
import { MOCK_CLAIM_CALL } from "./sdk-mock.js";

/**
 * Shared kit for tail fixtures: the account as it stands after the delay, with
 * the phantom token still on it, plus the matured withdrawal to claim.
 *
 * `totalValue` is not echoed from the props — the engine derives it from the
 * account balances through the price oracle — so each case states the balances
 * it wants and the expected total follows from them.
 */

export {
  ANY,
  ANY2,
  buildMarketSdk,
  CREDIT_ACCOUNT,
  CREDIT_FACADE,
  CREDIT_MANAGER,
  POS,
  RWA_ASSET,
  TOK_DECIMALS,
  UND,
  UND_DECIMALS,
} from "./market.js";

export const FIXTURE_PHANTOM =
  "0xcccccccccccccccccccccccccccccccccccccccc" as Address;

export interface TailCase {
  claimedToken: Address;
  claimedAmount: bigint;
  postClaimTotalValue: bigint;
  postClaimDebt: bigint;
  /** The operations the tail is expected to produce. */
  tailOps: ExpectedFlowOp[];
  expectedQuotaBalance?: bigint;
  /**
   * Pre-existing balances besides the withdrawal phantom. Defaults to
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
 * Mock sdk for a tail case. The phantom token inherits the claimed token's
 * decimals, so any 1:1 rescale through it stays the identity.
 */
export function buildTailSdk(
  c: Pick<TailCase, "claimedToken">,
  extras?: MarketSdkExtras & { phantom?: Address },
): OnchainSDK {
  const phantom = extras?.phantom ?? FIXTURE_PHANTOM;
  return buildMarketSdk({
    ...extras,
    extraDecimals: {
      ...extras?.extraDecimals,
      [phantom]:
        extras?.extraDecimals?.[c.claimedToken] ?? DECIMALS[c.claimedToken],
    },
  });
}

/** The matured withdrawal a tail case claims. */
export function buildClaimable(
  c: Pick<TailCase, "claimedToken" | "claimedAmount">,
): ClaimableWithdrawal {
  return {
    token: c.claimedToken,
    withdrawalPhantomToken: FIXTURE_PHANTOM,
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

/** Props for `finishIntent`: the account after the delay, plus the claimable. */
export function buildFinishProps<T extends ResumableIntent>(args: {
  intent: T;
  case: TailCase;
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
        token: FIXTURE_PHANTOM,
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
