import type { Address } from "viem";

import type {
  OnchainSDK,
  RWAOpenAccountRequirements,
} from "../../sdk/index.js";

/**
 * Extension point that ties each prerequisite kind to its detail payload.
 *
 * IMPORTANT: only add prerequisites that are *actionable by the transaction
 * sender* (the LP provider or borrower). A valid prerequisite is one the user
 * can resolve themselves before retrying, e.g. approve a token (`allowance`)
 * or perform offchain KYC verification.
 *
 * Do NOT add protocol- or admin-level state the user cannot change.
 */
export interface PrerequisiteDetailMap {
  /** ERC-20 allowance from `owner` to `spender` must cover `required`. */
  allowance: {
    token: Address;
    owner: Address;
    spender: Address;
    required: bigint;
    /** On-chain allowance read; only present when the read succeeded. */
    actual?: bigint;
  };
  /** ERC-20 balance of `owner` must cover `required`. */
  balance: {
    token: Address;
    owner: Address;
    required: bigint;
    /** On-chain balance read; only present when the read succeeded. */
    actual?: bigint;
  };
  /**
   * RWA (e.g. Securitize) open-account requirements: off-chain token
   * registration and/or EIP-712 signatures the borrower must provide before
   * opening a credit account in an RWA market.
   */
  rwaOpenRequirements: RWAOpenAccountRequirements;
}

export type PrerequisiteKind = keyof PrerequisiteDetailMap;

export type PrerequisiteDetail<K extends PrerequisiteKind = PrerequisiteKind> =
  PrerequisiteDetailMap[K];

/** Failure of the underlying on-chain read (revert, decode error, RPC error). */
export interface PrerequisiteError {
  /** Decoded revert reason / error name, human-readable. */
  reason: string;
  /** Original error, kept for debugging. */
  cause?: unknown;
}

export interface PrerequisiteBase<K extends PrerequisiteKind> {
  id: string;
  kind: K;
  title: string;
  detail: PrerequisiteDetail<K>;
}

/**
 * Outcome of verifying a single prerequisite: either the read succeeded (a
 * `satisfied` boolean) or it reverted/failed (an `error` with the revert
 * reason). The two variants are mutually exclusive.
 */
export type PrerequisiteResult<K extends PrerequisiteKind = PrerequisiteKind> =
  PrerequisiteBase<K> &
    (
      | { satisfied: boolean; error?: undefined }
      | { satisfied?: undefined; error: PrerequisiteError }
    );

/**
 * Discriminated union over every prerequisite kind. Switching on `kind`
 * narrows `detail` to the matching payload, so React components can render
 * kind-specific details with full type safety.
 */
export type AnyPrerequisiteResult = {
  [K in PrerequisiteKind]: PrerequisiteResult<K>;
}[PrerequisiteKind];

/** Shared inputs for building and verifying prerequisites. */
export interface PrerequisiteContext {
  sdk: OnchainSDK;
  /** Address whose balances/allowances are checked (the tx sender). */
  wallet: Address;
  /** Block to read at; defaults to latest. Only set for testnet forks. */
  blockNumber?: bigint;
}
