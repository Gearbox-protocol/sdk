import type { Address, Hex } from "viem";
import type { IGearboxError } from "./base.js";

/**
 * Target of a transaction is not a known Gearbox contract
 * (pool/facade/etc.)
 */
export interface UnsupportedTargetError extends IGearboxError {
  code: "unsupportedTarget";
  /** Target address no known Gearbox contract answers for. */
  target: Address;
}

/**
 * Pool call uses a function other than ERC4626 `deposit`/`redeem`.
 */
export interface UnsupportedPoolFunctionError extends IGearboxError {
  code: "unsupportedPoolFunction";
  /** Pool the call targets. */
  pool: Address;
  /** Decoded function name the SDK cannot preview. */
  functionName: string;
}

/**
 * Zapper call uses a function other than a known `deposit`/`redeem` variant.
 */
export interface UnsupportedZapperFunctionError extends IGearboxError {
  code: "unsupportedZapperFunction";
  /** Zapper contract the call targets. */
  zapper: Address;
  /** Decoded function name the SDK cannot preview. */
  functionName: string;
}

/**
 * Refusal answered by `previewOperation` for parsed operations it cannot
 * preview yet.
 */
export interface UnsupportedOperationError extends IGearboxError {
  code: "unsupportedOperation";
  /** The parsed operation kind (the `operation` discriminant). */
  operation: string;
}

/**
 * Delayed-withdrawal request or redemption log carries
 * non-empty `extraData` that cannot be decoded as a `DelayedIntent`.
 */
export interface InvalidDelayedIntentError extends IGearboxError {
  code: "invalidDelayedIntent";
  /** Raw `extraData` that failed to decode. */
  extraData: Hex;
  /** The decoding failure this refusal stands in front of. */
  cause?: Error;
}

/**
 * Pool operation preview read (ERC4626 preview/`balanceOf`) fails.
 */
export interface PoolOperationPreviewError extends IGearboxError {
  code: "poolOperationPreviewError";
  /** Pool the operation targeted. */
  pool: Address;
}

/**
 * The transaction could not be replayed: it is malformed.
 * Facade multicalls theoretically allow many more combinations of calls,
 * but sdk generates and parses only certain combinations.
 */
export interface MalformedTransactionError extends IGearboxError {
  code: "malformedTransaction";
}

/** {@inheritDoc MalformedTransactionError} */
export function malformedTransaction(
  detail: string,
  cause?: Error,
): MalformedTransactionError {
  return {
    code: "malformedTransaction",
    message: `The transaction could not be replayed: ${detail}`,
    ...(cause ? { cause } : {}),
  };
}
