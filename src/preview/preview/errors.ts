import type { Address, Hex } from "viem";

/**
 * Thrown by `previewOperation` for parsed operations it cannot preview yet.
 * Currently only pool operations and credit account opening are supported.
 */
export class UnsupportedOperationError extends Error {
  /** The parsed operation kind (the `operation` discriminant). */
  readonly operation: string;

  constructor(operation: string) {
    super(`operation "${operation}" is not supported by previewOperation`);
    this.name = "UnsupportedOperationError";
    this.operation = operation;
  }
}

/**
 * Thrown when a delayed-withdrawal request carries non-empty `extraData`
 * that cannot be decoded as a `DelayedIntent`. Requests produced by our
 * stack always encode a valid intent, so garbage here means a
 * malformed/foreign transaction that must not be previewed as if it were
 * fine.
 */
export class InvalidDelayedIntentError extends Error {
  /** Adapter the withdrawal request was addressed to. */
  readonly adapter: Address;
  /** Raw `extraData` that failed to decode. */
  readonly extraData: Hex;

  constructor(adapter: Address, extraData: Hex, cause?: unknown) {
    super(
      `cannot decode delayed intent from extraData ${extraData} of withdrawal request to adapter ${adapter}`,
      { cause },
    );
    this.name = "InvalidDelayedIntentError";
    this.adapter = adapter;
    this.extraData = extraData;
  }
}
