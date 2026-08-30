import type { Address } from "viem";
import type { IGearboxError } from "../../model/index.js";

// Re-exported from the SDK zapper module, where it is raised, to keep the
// preview public API stable.
export type { UnsupportedZapperFunctionError } from "../../onchain/market/zapper/errors.js";

/**
 * Refusal answered when the target of a transaction is neither a known
 * Gearbox pool nor a credit facade. A plain returned object per the SDK's
 * refusal vocabulary — not a thrown `Error`.
 */
export interface UnsupportedTargetError extends IGearboxError {
  code: "unsupportedTarget";
  /** Target address no known Gearbox contract answers for. */
  target: Address;
}

/**
 * Refusal answered when a pool call uses a function other than ERC4626
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
