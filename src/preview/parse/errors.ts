import type { Address } from "viem";
import type { IGearboxError } from "../../model/index.js";

// Re-exported from the SDK zapper module, where it is raised, to keep the
// preview public API stable.
export { UnsupportedZapperFunctionError } from "../../onchain/market/zapper/errors.js";

/**
 * Verdict answered when the target of a transaction is neither a known
 * Gearbox pool nor a credit facade. A plain returned object per the SDK's
 * refusal vocabulary — not a thrown `Error`.
 */
export interface UnsupportedTargetError extends IGearboxError {
  code: "unsupportedTarget";
  /** Target address no known Gearbox contract answers for. */
  target: Address;
}

function unsupportedTarget(target: Address): UnsupportedTargetError {
  return {
    code: "unsupportedTarget",
    message: `unsupported transaction target: ${target}`,
    target,
  };
}

Object.defineProperty(unsupportedTarget, Symbol.hasInstance, {
  value: (value: unknown): boolean =>
    typeof value === "object" &&
    value !== null &&
    (value as UnsupportedTargetError).code === "unsupportedTarget",
});

/**
 * Builds the verdict. Callable with or without `new`, so pre-declassing raise
 * sites keep compiling; `instanceof` matches on the `code` discriminant, and
 * the answer is never an `Error`.
 */
export const UnsupportedTargetError = unsupportedTarget as {
  (target: Address): UnsupportedTargetError;
  new (target: Address): UnsupportedTargetError;
};

/**
 * Verdict answered when a pool call uses a function other than ERC4626
 * `deposit`/`redeem`. A plain returned object per the SDK's refusal
 * vocabulary — not a thrown `Error`.
 */
export interface UnsupportedPoolFunctionError extends IGearboxError {
  code: "unsupportedPoolFunction";
  /** Pool the call targets. */
  pool: Address;
  /** Decoded function name the SDK cannot preview. */
  functionName: string;
}

function unsupportedPoolFunction(
  pool: Address,
  functionName: string,
): UnsupportedPoolFunctionError {
  return {
    code: "unsupportedPoolFunction",
    message: `unsupported pool function "${functionName}" on ${pool}`,
    pool,
    functionName,
  };
}

Object.defineProperty(unsupportedPoolFunction, Symbol.hasInstance, {
  value: (value: unknown): boolean =>
    typeof value === "object" &&
    value !== null &&
    (value as UnsupportedPoolFunctionError).code === "unsupportedPoolFunction",
});

/**
 * Builds the verdict. Callable with or without `new`, so pre-declassing raise
 * sites keep compiling; `instanceof` matches on the `code` discriminant, and
 * the answer is never an `Error`.
 */
export const UnsupportedPoolFunctionError = unsupportedPoolFunction as {
  (pool: Address, functionName: string): UnsupportedPoolFunctionError;
  new (pool: Address, functionName: string): UnsupportedPoolFunctionError;
};
