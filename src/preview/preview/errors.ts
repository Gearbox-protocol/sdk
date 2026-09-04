import type { Address } from "viem";
import type {
  AdapterCallOutsideBracketError,
  IGearboxError,
  InvalidTransactionValueError,
  MalformedBracketError,
  MalformedBracketKind,
  NonAdapterCallInBracketError,
  UnpreviewableAdapterCallError,
  UnsupportedOutOfBracketCallError,
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

const MALFORMED_BRACKET_MESSAGE: Record<MalformedBracketKind, string> = {
  nested: "nested storeExpectedBalances/compareBalances bracket",
  unmatchedCompare: "compareBalances without a preceding storeExpectedBalances",
  unmatchedStore: "storeExpectedBalances without a matching compareBalances",
};

/**
 * Builds a {@link MalformedBracketError} for the given bracket invariant.
 **/
export function malformedBracketError(
  kind: MalformedBracketKind,
): MalformedBracketError {
  return {
    code: "malformedBracket",
    message: MALFORMED_BRACKET_MESSAGE[kind],
    kind,
  };
}

/**
 * Builds an {@link AdapterCallOutsideBracketError} for `adapter`.
 **/
export function adapterCallOutsideBracketError(
  adapter: Address,
): AdapterCallOutsideBracketError {
  return {
    code: "adapterCallOutsideBracket",
    message: `call to ${adapter} outside of a storeExpectedBalances/compareBalances bracket`,
    adapter,
  };
}

/**
 * Builds a {@link NonAdapterCallInBracketError} for `target`.
 **/
export function nonAdapterCallInBracketError(
  target: Address,
): NonAdapterCallInBracketError {
  return {
    code: "nonAdapterCallInBracket",
    message: `call to ${target} between storeExpectedBalances and compareBalances is not an adapter call`,
    target,
  };
}

function asCause(cause: unknown): Error {
  return cause instanceof Error ? cause : new Error(String(cause));
}

/**
 * Builds an {@link UnpreviewableAdapterCallError} for a bracketed adapter
 * call that could not be replayed.
 **/
export function unpreviewableAdapterCallError(
  adapter: Address,
  cause: unknown,
): UnpreviewableAdapterCallError {
  const err = asCause(cause);
  return {
    code: "unpreviewableAdapterCall",
    message: err.message,
    adapter,
    cause: err,
  };
}

/**
 * Builds an {@link UnsupportedOutOfBracketCallError} for an allowed
 * out-of-bracket adapter call that could not be replayed.
 **/
export function unsupportedOutOfBracketCallError(
  adapter: Address,
  cause: unknown,
): UnsupportedOutOfBracketCallError {
  const err = asCause(cause);
  return {
    code: "unsupportedOutOfBracketCall",
    message: err.message,
    adapter,
    cause: err,
  };
}

/**
 * Builds an {@link InvalidTransactionValueError} when `msg.value` does not
 * fit into the declared WETH collateral.
 **/
export function invalidTransactionValueError(
  value: bigint,
  wethCollateral: bigint,
): InvalidTransactionValueError {
  return {
    code: "invalidTransactionValue",
    message: `transaction value ${value} exceeds WETH collateral ${wethCollateral}`,
    value,
    wethCollateral,
  };
}
