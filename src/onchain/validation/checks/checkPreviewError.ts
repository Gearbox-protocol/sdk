import type {
  IGearboxError,
  MalformedPreviewError,
  MalformedTransactionError,
} from "../../../model/index.js";
import { malformedTransaction } from "../../../model/index.js";

/**
 * The SDK could not replay the transaction.
 *
 * Only a {@link MalformedPreviewError} lands here. An `unpriceableToken`
 * warning says the transaction is fine and the SDK could not fully evaluate
 * it, which is a caveat on the numbers rather than a reason to refuse — it
 * stays on the preview for the caller to surface.
 */
export function checkPreviewError(
  warning: IGearboxError | undefined,
): MalformedTransactionError[] {
  if (!warning || !isMalformedPreviewError(warning)) {
    return [];
  }
  return [malformedTransaction(warning)];
}

/**
 * Whether the preview warning means the transaction itself is malformed,
 * rather than that only the evaluation was incomplete.
 */
export function isMalformedPreviewError(
  warning: IGearboxError,
): warning is MalformedPreviewError {
  switch (warning.code) {
    case "malformedBracket":
    case "adapterCallOutsideBracket":
    case "nonAdapterCallInBracket":
    case "unpreviewableAdapterCall":
    case "unsupportedOutOfBracketCall":
    case "invalidTransactionValue":
      return true;
    default:
      return false;
  }
}
