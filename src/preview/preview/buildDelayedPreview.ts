import { type Address, isAddressEqual } from "viem";
import { AssetsMap } from "../../sdk/index.js";
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
 * delayed withdrawal is claimed and its intent (if any) is resumed.
 *
 * Pure function: reads the post-instant account state, never mutates it and
 * performs no network access. Swaps that the resume flow would route through
 * the router are estimated with the injected oracle conversion; tokens the
 * oracle cannot price contribute nothing and set a non-fatal
 * `ERROR_UNPRICEABLE_TOKEN` error on the preview.
 *
 * Common claim step (all intents): the phantom token is burned (balance and
 * quota zeroed) and the claim token is credited with the same amount 1:1.
 *
 * Intent-specific resume:
 * - `CLOSE_ACCOUNT`: everything is swapped into the underlying, the debt is
 *   fully repaid and the rest is withdrawn to the user.
 * - `DECREASE_LEVERAGE`: the claimed amount is swapped into the underlying
 *   and used to decrease the debt.
 * - `WITHDRAW_COLLATERAL`: the recorded amount of the recorded token is
 *   withdrawn to the user, the rest of the claimed amount decreases the debt.
 * - other intents and `intent: undefined`: claim-only, the post-claim swap
 *   target is not recoverable from the intent.
 *
 * The changes (`debtChange`, `quotasChange`, `assetsChange`) are reported
 * relative to the account state before the whole transaction, not the
 * post-instant state: to the user the delayed preview answers "where will
 * the account end up compared to now", so the transient phantom token
 * (minted by the instant part, burned by the claim) nets out to nothing.
 *
 * @param state - Account state after the instant part of the transaction.
 * @param before - Account state before the transaction (the diff base).
 */
export function buildDelayedPreview(
  state: CreditAccountState,
  before: CreditAccountState,
  detected: DetectedDelayedOperation,
  convert: ConvertFn,
): InstantOperationPreview {
  const { request, intent } = detected;

  const post = state.clone();
  let error: OperationPreviewError | undefined;

  const safeConvert: ConvertFn = (token, to, amount) => {
    try {
      return convert(token, to, amount);
    } catch {
      error ??= {
        code: ERROR_UNPRICEABLE_TOKEN,
        message: `cannot price token ${token}`,
      };
      return 0n;
    }
  };

  // Claim step: burn the phantom token, receive the claim token 1:1
  const claimed = post.balances.getOrZero(request.phantomToken);
  post.balances.upsert(request.phantomToken, 0n);
  post.quotas.upsert(request.phantomToken, 0n);
  post.balances.inc(request.claimToken, claimed);

  if (intent?.type === "CLOSE_ACCOUNT") {
    // Everything is swapped into underlying, the debt is repaid in full and
    // the remainder is withdrawn to the user
    const totalValue = post.balances.sum((token, balance) =>
      balance > 0n ? safeConvert(token, post.underlying, balance) : 0n,
    );
    const receivedAmount =
      totalValue > post.totalDebt ? totalValue - post.totalDebt : 0n;
    const preview: CloseCreditAccountPreview = {
      operation: "CloseCreditAccount",
      permanent: true,
      creditManager: post.creditManager,
      creditAccount: post.creditAccount,
      receivedAmount,
      error,
    };
    return preview;
  }

  const collateralWithdrawn = new AssetsMap();

  /**
   * Swaps `amount` of the claim token (capped at the running balance) into
   * the underlying (oracle estimate) and repays the debt with it.
   */
  const repayFromClaim = (amount: bigint): void => {
    const available = post.balances.getOrZero(request.claimToken);
    const spent = amount > available ? available : amount;
    if (spent <= 0n) {
      return;
    }
    const received = safeConvert(request.claimToken, post.underlying, spent);
    post.balances.dec(request.claimToken, spent);
    post.balances.inc(post.underlying, received);
    post.repay(received);
  };

  if (intent?.type === "DECREASE_LEVERAGE") {
    repayFromClaim(claimed);
  } else if (intent?.type === "WITHDRAW_COLLATERAL") {
    // The recorded amount goes to the wallet, the rest of the claimed
    // amount decreases the debt
    const running = post.balances.getOrZero(intent.withdrawToken);
    const withdrawn =
      intent.withdrawAmount > running ? running : intent.withdrawAmount;
    if (withdrawn > 0n) {
      post.balances.dec(intent.withdrawToken, withdrawn);
      collateralWithdrawn.upsert(intent.withdrawToken, withdrawn);
    }
    const remainingClaim =
      isAddressEqual(intent.withdrawToken, request.claimToken) &&
      claimed > withdrawn
        ? claimed - withdrawn
        : claimed;
    repayFromClaim(remainingClaim);
  }
  // other intents and intent: undefined are claim-only

  const totalValue = post.balances.sum((token, balance) =>
    balance > PREVIEW_DUST ? safeConvert(token, post.underlying, balance) : 0n,
  );

  const preview: AdjustCreditAccountPreview = {
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
    error,
  };
  return preview;
}
