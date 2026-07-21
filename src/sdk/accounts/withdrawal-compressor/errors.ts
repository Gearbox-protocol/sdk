import type { Hex } from "viem";

/**
 * Thrown when a delayed-withdrawal request or redemption log carries
 * non-empty `extraData` that cannot be decoded as a `DelayedIntent`.
 * Requests produced by our stack always encode a valid intent, so garbage
 * here means a malformed/foreign transaction that must not be previewed as
 * if it were fine.
 */
export class InvalidDelayedIntentError extends Error {
  /** Raw `extraData` that failed to decode. */
  readonly extraData: Hex;

  constructor(extraData: Hex, cause?: unknown) {
    super(`cannot decode delayed intent from extraData ${extraData}`, {
      cause,
    });
    this.name = "InvalidDelayedIntentError";
    this.extraData = extraData;
  }
}
