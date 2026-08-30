import type { IGearboxError } from "../../model/index.js";

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
