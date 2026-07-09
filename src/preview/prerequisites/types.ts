import type { Address } from "viem";

import type { OnchainSDK } from "../../sdk/index.js";
import type { AllowanceResult } from "./AllowancePrerequisite.js";
import type { BalanceResult } from "./BalancePrerequisite.js";
import type { RWAOpenRequirementsResult } from "./RWAOpenRequirementsPrerequisite.js";

/** Failure of the underlying on-chain read (revert, decode error, RPC error). */
export interface PrerequisiteError {
  /** Decoded revert reason / error name, human-readable. */
  reason: string;
  /** Original error, kept for debugging. */
  cause?: unknown;
}

/**
 * Outcome of verifying a single prerequisite: either the read succeeded (a
 * `satisfied` boolean) or it reverted/failed (an `error` with the revert
 * reason).
 */
export type PrerequisiteOutcome =
  | { satisfied: boolean; error?: undefined }
  | { satisfied?: undefined; error: PrerequisiteError };

/**
 * Discriminated union over every prerequisite kind
 *
 * Only add prerequisites that are actionable by tx sender.
 * A valid prerequisite is one the user can resolve themselves before retrying,
 * e.g. approve a token (`allowance`) or perform offchain KYC verification.
 */
export type PrerequisiteResult =
  | AllowanceResult
  | BalanceResult
  | RWAOpenRequirementsResult;

export type PrerequisiteKind = PrerequisiteResult["kind"];

/** Shared inputs for building and verifying prerequisites. */
export interface PrerequisiteContext {
  sdk: OnchainSDK;
  /** Address whose balances/allowances are checked (the tx sender). */
  wallet: Address;
  /** Block to read at; defaults to latest. Only set for testnet forks. */
  blockNumber?: bigint;
}
