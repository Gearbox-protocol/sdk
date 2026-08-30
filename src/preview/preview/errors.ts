import type { IGearboxError } from "../../model/index.js";

/**
 * Verdict answered by `previewOperation` for parsed operations it cannot
 * preview yet. A plain returned object per the SDK's refusal vocabulary —
 * not a thrown `Error`.
 */
export interface UnsupportedOperationError extends IGearboxError {
  code: "unsupportedOperation";
  /** The parsed operation kind (the `operation` discriminant). */
  operation: string;
}

function unsupportedOperation(operation: string): UnsupportedOperationError {
  return {
    code: "unsupportedOperation",
    message: `operation "${operation}" is not supported by previewOperation`,
    operation,
  };
}

Object.defineProperty(unsupportedOperation, Symbol.hasInstance, {
  value: (value: unknown): boolean =>
    typeof value === "object" &&
    value !== null &&
    (value as UnsupportedOperationError).code === "unsupportedOperation",
});

/**
 * Builds the verdict. Callable with or without `new`, so pre-declassing raise
 * sites keep compiling; `instanceof` matches on the `code` discriminant, and
 * the answer is never an `Error`.
 */
export const UnsupportedOperationError = unsupportedOperation as {
  (operation: string): UnsupportedOperationError;
  new (operation: string): UnsupportedOperationError;
};
