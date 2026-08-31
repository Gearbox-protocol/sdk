import type { Address } from "viem";
import {
  ERROR_UNPRICEABLE_TOKEN,
  type IGearboxError,
  type OperationPreviewError,
} from "../../model/index.js";

/**
 * Refusal answered by `previewOperation` for parsed operations it cannot
 * preview yet. A plain returned object per the SDK's refusal vocabulary —
 * not a thrown `Error`.
 */
export interface UnsupportedOperationError extends IGearboxError {
  code: "unsupportedOperation";
  /** The parsed operation kind (the `operation` discriminant). */
  operation: string;
}

/**
 * Preview limitation (2xxx): the oracle could not price `token`. Callers
 * attach this with `error ??=` so a malformed-transaction (1xxx) error
 * already recorded keeps precedence.
 **/
export function unpriceableTokenError(token: Address): OperationPreviewError {
  return {
    code: ERROR_UNPRICEABLE_TOKEN,
    message: `cannot price token ${token}`,
  };
}
