import { type Address, isAddressEqual } from "viem";
import { BigIntMath } from "../../common-utils/index.js";
import type { DelayedWithdrawalRequest } from "../../plugins/adapters/index.js";
import {
  AssetsMap,
  type DelayedWithdrawCollateralIntent,
} from "../../sdk/index.js";
import type { CreditAccountState } from "./CreditAccountState.js";
import type { DetectedDelayedOperation } from "./detectDelayedOperation.js";
import {
  type AdjustCreditAccountPreview,
  type CloseCreditAccountPreview,
  ERROR_UNPRICEABLE_TOKEN,
  type InstantOperationPreview,
  type OperationPreviewError,
  PREVIEW_DUST,
} from "./types.js";

/**
 * Oracle conversion, injected so unit tests don't need a market
 */
export type ConvertFn = (token: Address, to: Address, amount: bigint) => bigint;

/**
 * Builds the best-effort preview of the account state after the detected
 * delayed withdrawal is claimed and its intent (if any) is resumed:
 * the claim itself followed by the intent-specific tail
 *
 * Pure function: the input states are never mutated and no network access is performed.
 * Swaps are estimated with the injected conversion; tokens it cannot price contribute
 * nothing and set a non-fatal `ERROR_UNPRICEABLE_TOKEN` error on the
 * preview.
 *
 * The changes (e.g. `debtChange`) are reported relative to the account
 * state before the whole transaction.
 *
 * @param afterInstant - Account state after the instant part of the
 * transaction.
 * @param before - Account state before the transaction (the diff base).
 * @param receivedToken - Token the `CLOSE_ACCOUNT` resume withdraws to the
 * user: the unwrapped underlying (vault asset) for RWA markets, the
 * underlying itself otherwise.
 */
export function buildDelayedPreview(
  afterInstant: CreditAccountState,
  before: CreditAccountState,
  detected: DetectedDelayedOperation,
  convert: ConvertFn,
  receivedToken: Address,
): InstantOperationPreview {
  const { request, intent } = detected;

  const post = afterInstant.clone();
  const converter = makeSafeConverter(convert);
  const claimed = applyClaim(post, request);
  const collateralWithdrawn = new AssetsMap();

  switch (intent?.type) {
    case "CLOSE_ACCOUNT":
      return buildClosePreview(post, converter, receivedToken);

    case "DECREASE_LEVERAGE":
      repayFromClaim(post, request.claimToken, converter.convert, claimed);
      break;

    case "WITHDRAW_COLLATERAL": {
      applyWithdrawCollateral(
        post,
        request,
        intent,
        converter,
        collateralWithdrawn,
      );
      break;
    }

    default:
      // other intents and intent: undefined are claim-only: the post-claim
      // swap target is not recoverable from the intent
      break;
  }

  return buildAdjustPreview(post, before, collateralWithdrawn, converter);
}

/**
 * Oracle conversion that never throws: tokens the oracle cannot price
 * convert to zero and set {@link SafeConverter.error} instead.
 */
interface SafeConverter {
  convert: ConvertFn;
  /**
   * Set after the first token the oracle could not price
   */
  readonly error: OperationPreviewError | undefined;
}

function makeSafeConverter(convert: ConvertFn): SafeConverter {
  let error: OperationPreviewError | undefined;
  return {
    convert: (token, to, amount) => {
      try {
        return convert(token, to, amount);
      } catch {
        error ??= {
          code: ERROR_UNPRICEABLE_TOKEN,
          message: `cannot price token ${token}`,
        };
        return 0n;
      }
    },
    get error() {
      return error;
    },
  };
}

/**
 * Claim step, common to all intents: burns the phantom token (balance and
 * quota zeroed) and credits the claim token with the same amount 1:1.
 *
 * @returns The claimed amount.
 */
function applyClaim(
  post: CreditAccountState,
  request: DelayedWithdrawalRequest,
): bigint {
  const claimed = post.balances.getOrZero(request.phantomToken);
  post.balances.upsert(request.phantomToken, 0n);
  post.quotas.upsert(request.phantomToken, 0n);
  post.balances.inc(request.claimToken, claimed);
  return claimed;
}

/**
 * `WITHDRAW_COLLATERAL` operation tail:
 * after the claim, `withdrawAmount` of `withdrawToken` goes to the
 * user's wallet and the rest of the claim proceeds repay the debt.
 *
 * Tokens involved (Securitize ACRED redemption as the example):
 * - claim token (`request.claimToken`) - the token the claim pays out;
 *   redeeming ACRED pays out USDC.
 * - withdraw token (`intent.withdrawToken`) - the token the user receives
 *   in the wallet. It can be the claim token itself (withdraw USDC) or a
 *   different token (withdraw RLUSD, bought with the claimed USDC).
 * - source token (`intent.sourceToken`) - the token that was sent to
 *   redemption when the withdrawal was requested (ACRED). The user may also
 *   withdraw this token: e.g. redeem part of the ACRED position and
 *   withdraw some of the ACRED still left on the account.
 *
 * The preview models the operation tail in three steps:
 * 1. Take `withdrawAmount` of `withdrawToken` from the account balance.
 *    This handles the two simple cases: the withdraw token is the claim
 *    token (the claim just credited it) or the source token (some of it is
 *    still on the account).
 * 2. If the account holds less than `withdrawAmount` of `withdrawToken`,
 *    buy the missing part with the claim-token balance. This happens when
 *    the withdraw token differs from the claim token: e.g. withdrawing
 *    RLUSD from a claim that paid out USDC - RLUSD is bought with the
 *    claimed USDC. If even the whole claim balance cannot cover it, spend
 *    all of it and withdraw whatever it buys.
 * 3. Convert the claim tokens still left into the underlying and repay the
 *    debt with them, but no more than the intent's `debtRepaid` target;
 *    whatever is not spent on repayment stays on the account as underlying.
 */
function applyWithdrawCollateral(
  post: CreditAccountState,
  request: DelayedWithdrawalRequest,
  intent: DelayedWithdrawCollateralIntent,
  converter: SafeConverter,
  collateralWithdrawn: AssetsMap,
): void {
  const { withdrawToken, withdrawAmount, debtRepaid } = intent;
  const { claimToken } = request;
  const sameToken = isAddressEqual(withdrawToken, claimToken);

  // Step 1: take the withdraw token from the account balance first
  // (withdrawing USDC just credited by the claim, or ACRED still held)
  const fromBalance = BigIntMath.min(
    withdrawAmount,
    post.balances.getOrZero(withdrawToken),
  );
  post.balances.dec(withdrawToken, fromBalance);
  let withdrawn = fromBalance;

  // Step 2: the account holds less than withdrawAmount of the withdraw
  // token - buy the missing amount with the claim-token balance, e.g.
  // withdrawing RLUSD bought with the claimed USDC (when the withdraw token
  // is the claim token itself, step 1 already spent it)
  const missing = withdrawAmount - fromBalance;
  if (missing > 0n && !sameToken) {
    const available = post.balances.getOrZero(claimToken);
    const cost = converter.convert(withdrawToken, claimToken, missing);
    if (cost > 0n && cost <= available) {
      post.balances.dec(claimToken, cost);
      withdrawn += missing;
    } else if (available > 0n) {
      // the whole claim balance is not enough: spend all of it and withdraw
      // whatever it buys
      post.balances.dec(claimToken, available);
      withdrawn += converter.convert(claimToken, withdrawToken, available);
    }
  }
  if (withdrawn > 0n) {
    collateralWithdrawn.upsert(withdrawToken, withdrawn);
  }

  // Step 3: convert the claim tokens still left (USDC not spent on the
  // withdrawal) into the underlying and repay the debt with them, no more
  // than the intent's debtRepaid target
  const remaining = post.balances.getOrZero(claimToken);
  if (remaining > 0n) {
    const proceeds = converter.convert(claimToken, post.underlying, remaining);
    post.balances.dec(claimToken, remaining);
    post.balances.inc(post.underlying, proceeds);
    post.repay(BigIntMath.min(proceeds, debtRepaid));
  }
}

/**
 * `DECREASE_LEVERAGE` operation tail: swaps `amount` of the claim token
 * (capped at the running balance) into the underlying and repays the debt
 * with it.
 */
function repayFromClaim(
  post: CreditAccountState,
  claimToken: Address,
  convert: ConvertFn,
  amount: bigint,
): void {
  const spent = BigIntMath.min(amount, post.balances.getOrZero(claimToken));
  if (spent <= 0n) {
    return;
  }
  const received = convert(claimToken, post.underlying, spent);
  post.balances.dec(claimToken, spent);
  post.balances.inc(post.underlying, received);
  post.repay(received);
}

/**
 * Oracle estimate of the account's total value in the underlying, ignoring
 * balances at or below `dust`.
 */
function totalValueInUnderlying(
  post: CreditAccountState,
  convert: ConvertFn,
  dust: bigint,
): bigint {
  return post.balances.sum((token, balance) =>
    balance > dust ? convert(token, post.underlying, balance) : 0n,
  );
}

/**
 * `CLOSE_ACCOUNT` operation tail: everything is swapped into the
 * underlying, the debt is repaid in full and the remainder is withdrawn to
 * the user as `receivedToken`.
 */
function buildClosePreview(
  post: CreditAccountState,
  converter: SafeConverter,
  receivedToken: Address,
): CloseCreditAccountPreview {
  const totalValue = totalValueInUnderlying(post, converter.convert, 0n);
  return {
    operation: "CloseCreditAccount",
    permanent: false,
    creditManager: post.creditManager,
    creditAccount: post.creditAccount,
    // Oracle estimate computed in the underlying; RWA underlyings convert
    // 1:1 with their vault asset, so the amount holds for `receivedToken`
    receivedAmount: {
      token: receivedToken,
      balance: BigIntMath.max(totalValue - post.totalDebt, 0n),
    },
    error: converter.error,
  };
}

function buildAdjustPreview(
  post: CreditAccountState,
  before: CreditAccountState,
  collateralWithdrawn: AssetsMap,
  converter: SafeConverter,
): AdjustCreditAccountPreview {
  const totalValue = totalValueInUnderlying(
    post,
    converter.convert,
    PREVIEW_DUST,
  );
  return {
    operation: "AdjustCreditAccount",
    creditManager: post.creditManager,
    creditAccount: post.creditAccount,
    // the resume flow adds nothing from the wallet
    collateralAdded: [],
    collateralWithdrawn: collateralWithdrawn.toAssets(),
    totalValue,
    debt: post.debt,
    // relative to the pre-transaction state: where the account will end up
    // compared to now, once the withdrawal is claimed and the intent resumed
    debtChange: post.debt - before.debt,
    quotas: post.quotas.toAssets(0n),
    quotasChange: post.quotas.difference(before.quotas).toAssets(),
    assets: post.balances.toAssets(PREVIEW_DUST),
    assetsChange: post.balances
      .difference(before.balances)
      .toAssets(PREVIEW_DUST),
    error: converter.error,
  };
}
