import type { Address } from "viem";
import type { IGearboxError } from "../../../model/index.js";

/**
 * Verdict answered when a zapper call uses a function other than a known
 * `deposit`/`redeem` variant. A plain returned object per the SDK's refusal
 * vocabulary — not a thrown `Error`.
 */
export interface UnsupportedZapperFunctionError extends IGearboxError {
  code: "unsupportedZapperFunction";
  /** Zapper contract the call targets. */
  zapper: Address;
  /** Decoded function name the SDK cannot preview. */
  functionName: string;
}

function unsupportedZapperFunction(
  zapper: Address,
  functionName: string,
): UnsupportedZapperFunctionError {
  return {
    code: "unsupportedZapperFunction",
    message: `unsupported zapper function "${functionName}" on ${zapper}`,
    zapper,
    functionName,
  };
}

Object.defineProperty(unsupportedZapperFunction, Symbol.hasInstance, {
  value: (value: unknown): boolean =>
    typeof value === "object" &&
    value !== null &&
    (value as UnsupportedZapperFunctionError).code ===
      "unsupportedZapperFunction",
});

/**
 * Builds the verdict. Callable with or without `new`, so pre-declassing raise
 * sites keep compiling; `instanceof` matches on the `code` discriminant, and
 * the answer is never an `Error`.
 */
export const UnsupportedZapperFunctionError = unsupportedZapperFunction as {
  (zapper: Address, functionName: string): UnsupportedZapperFunctionError;
  new (zapper: Address, functionName: string): UnsupportedZapperFunctionError;
};
