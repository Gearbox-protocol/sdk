import type { Hex } from "viem";
import type { IGearboxError } from "../../../model/index.js";

/**
 * Verdict answered when a delayed-withdrawal request or redemption log carries
 * non-empty `extraData` that cannot be decoded as a `DelayedIntent`.
 * Requests produced by our stack always encode a valid intent, so garbage
 * here means a malformed/foreign transaction that must not be previewed as
 * if it were fine. A plain returned object — not a thrown `Error`.
 */
export interface InvalidDelayedIntentError extends IGearboxError {
  code: "invalidDelayedIntent";
  /** Raw `extraData` that failed to decode. */
  extraData: Hex;
  /** The decoding failure this verdict stands in front of. */
  cause?: Error;
}

function invalidDelayedIntent(
  extraData: Hex,
  cause?: unknown,
): InvalidDelayedIntentError {
  const verdict: InvalidDelayedIntentError = {
    code: "invalidDelayedIntent",
    message: `cannot decode delayed intent from extraData ${extraData}`,
    extraData,
  };
  if (cause !== undefined) {
    // Same normalisation `decodeSimulationError` applies: a non-Error reason
    // is kept, stringified, rather than dropped.
    verdict.cause = cause instanceof Error ? cause : new Error(String(cause));
  }
  return verdict;
}

Object.defineProperty(invalidDelayedIntent, Symbol.hasInstance, {
  value: (value: unknown): boolean =>
    typeof value === "object" &&
    value !== null &&
    (value as InvalidDelayedIntentError).code === "invalidDelayedIntent",
});

/**
 * Builds the verdict. Callable with or without `new`, so pre-declassing raise
 * sites keep compiling; `instanceof` matches on the `code` discriminant, and
 * the answer is never an `Error`.
 */
export const InvalidDelayedIntentError = invalidDelayedIntent as {
  (extraData: Hex, cause?: unknown): InvalidDelayedIntentError;
  new (extraData: Hex, cause?: unknown): InvalidDelayedIntentError;
};
