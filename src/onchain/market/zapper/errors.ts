import type { Address } from "viem";
import type { IGearboxError } from "../../../model/index.js";

/**
 * Refusal answered when a zapper call uses a function other than a known
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
