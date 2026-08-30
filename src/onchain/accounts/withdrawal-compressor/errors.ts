import type { Hex } from "viem";
import type { IGearboxError } from "../../../model/index.js";

/**
 * Refusal answered when a delayed-withdrawal request or redemption log carries
 * non-empty `extraData` that cannot be decoded as a `DelayedIntent`.
 * Requests produced by our stack always encode a valid intent, so garbage
 * here means a malformed/foreign transaction that must not be previewed as
 * if it were fine. A plain returned object — not a thrown `Error`.
 */
export interface InvalidDelayedIntentError extends IGearboxError {
  code: "invalidDelayedIntent";
  /** Raw `extraData` that failed to decode. */
  extraData: Hex;
  /** The decoding failure this refusal stands in front of. */
  cause?: Error;
}

/** Builds the refusal — a plain returned object, never a thrown `Error`. */
export function invalidDelayedIntent(
  extraData: Hex,
  cause?: unknown,
): InvalidDelayedIntentError {
  const refusal: InvalidDelayedIntentError = {
    code: "invalidDelayedIntent",
    message: `cannot decode delayed intent from extraData ${extraData}`,
    extraData,
  };
  if (cause !== undefined) {
    // Same normalisation `decodeSimulationError` applies: a non-Error reason
    // is kept, stringified, rather than dropped.
    refusal.cause = cause instanceof Error ? cause : new Error(String(cause));
  }
  return refusal;
}
