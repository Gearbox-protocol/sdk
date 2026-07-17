import { type Address, isAddressEqual } from "viem";
import { BigIntMath } from "../../common-utils/index.js";
import type { DelayedWithdrawalRequest } from "../../plugins/adapters/index.js";
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
 * post-instant-part state: to the user the delayed preview answers "where will
 * the account end up compared to now", so the transient phantom token
 * (minted by the instant part, burned by the claim) nets out to nothing.
 *
 * @param afterInstant - Account state after the instant part of the
 * transaction.
 * @param before - Account state before the transaction (the diff base).
 */
export function buildDelayedPreview(
  afterInstant: CreditAccountState,
  before: CreditAccountState,
  detected: DetectedDelayedOperation,
  convert: ConvertFn,
): InstantOperationPreview {
  const { request, intent } = detected;

  const post = afterInstant.clone();
  const converter = makeSafeConverter(convert);
  const claimed = applyClaim(post, request);
  const collateralWithdrawn = new AssetsMap();

  switch (intent?.type) {
    case "CLOSE_ACCOUNT":
      return buildClosePreview(post, converter);

    case "DECREASE_LEVERAGE":
      repayFromClaim(post, request.claimToken, converter.convert, claimed);
      break;

    case "WITHDRAW_COLLATERAL": {
      // The recorded amount goes to the wallet, the rest of the claimed
      // amount decreases the debt
      const withdrawn = BigIntMath.min(
        intent.withdrawAmount,
        post.balances.getOrZero(intent.withdrawToken),
      );
      if (withdrawn > 0n) {
        post.balances.dec(intent.withdrawToken, withdrawn);
        collateralWithdrawn.upsert(intent.withdrawToken, withdrawn);
      }
      // When the withdrawn token is the claim token itself, the withdrawn
      // part already left the claimed amount and cannot repay debt. The
      // clamp covers withdrawals partially served by a pre-existing balance
      // of the claim token (withdrawn > claimed)
      const claimSpentOnWithdrawal = isAddressEqual(
        intent.withdrawToken,
        request.claimToken,
      )
        ? withdrawn
        : 0n;
      repayFromClaim(
        post,
        request.claimToken,
        converter.convert,
        BigIntMath.max(claimed - claimSpentOnWithdrawal, 0n),
      );
      break;
    }

    default:
      // other intents and intent: undefined are claim-only
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
 * Swaps `amount` of the claim token (capped at the running balance) into
 * the underlying (oracle estimate) and repays the debt with it.
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
 * `CLOSE_ACCOUNT` resume: everything is swapped into the underlying, the
 * debt is repaid in full and the remainder is withdrawn to the user.
 */
function buildClosePreview(
  post: CreditAccountState,
  converter: SafeConverter,
): CloseCreditAccountPreview {
  const totalValue = totalValueInUnderlying(post, converter.convert, 0n);
  return {
    operation: "CloseCreditAccount",
    permanent: false,
    creditManager: post.creditManager,
    creditAccount: post.creditAccount,
    // Oracle estimate denominated in the underlying
    receivedAmount: {
      token: post.underlying,
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
