import type { Address } from "viem";

import type {
  OnchainSDK,
  RWAMissingOpenAccountRequirements,
  RWAOpenAccountRequirements,
} from "../../sdk/index.js";

/**
 * Extension point that ties each prerequisite kind to the detail payload
 * known at construction time (before any on-chain read).
 *
 * IMPORTANT: only add prerequisites that are *actionable by the transaction
 * sender* (the LP provider or borrower). A valid prerequisite is one the user
 * can resolve themselves before retrying, e.g. approve a token (`allowance`)
 * or perform offchain KYC verification.
 *
 * Do NOT add protocol- or admin-level state the user cannot change.
 */
export interface PrerequisiteStaticDetailMap {
  /** ERC-20 allowance from `owner` to `spender` must cover `required`. */
  allowance: {
    token: Address;
    owner: Address;
    spender: Address;
    required: bigint;
  };
  /** ERC-20 balance of `owner` must cover `required`. */
  balance: {
    token: Address;
    owner: Address;
    required: bigint;
  };
  /**
   * RWA (e.g. Securitize) open-account requirements: off-chain token
   * registration and/or EIP-712 signatures the borrower must provide before
   * opening a credit account in an RWA market.
   */
  rwaOpenRequirements: {
    /** RWA token (e.g. Securitize DSToken) the requirements are checked for. */
    token: Address;
    /** Credit manager of the RWA market. */
    creditManager: Address;
    /** RWA factory that gates the token. */
    factory: Address;
  };
}

/**
 * Companion of {@link PrerequisiteStaticDetailMap}: per-kind detail fields
 * that are only populated at verify time, by the on-chain reads.
 */
export interface PrerequisiteVerifyDetailMap {
  allowance: {
    /** On-chain allowance read; only present when the read succeeded. */
    actual?: bigint;
  };
  balance: {
    /** On-chain balance read; only present when the read succeeded. */
    actual?: bigint;
  };
  rwaOpenRequirements: {
    /**
     * Full requirements fetched at verify time via
     * `sdk.accounts.getOpenAccountRequirements`; only present when the read
     * succeeded and the factory gates the token.
     */
    requirements?: RWAOpenAccountRequirements;
    /**
     * Subset of `requirements` still unfulfilled, computed by the RWA
     * factory at verify time (`IRWAFactory.getMissingRequirements`);
     * `undefined` when everything is satisfied.
     */
    missing?: RWAMissingOpenAccountRequirements;
  };
}

export type PrerequisiteKind = keyof PrerequisiteStaticDetailMap;

export type PrerequisiteDetail<K extends PrerequisiteKind = PrerequisiteKind> =
  PrerequisiteStaticDetailMap[K] & PrerequisiteVerifyDetailMap[K];

/**
 * Constructor props of the prerequisite matching kind `K`: its static detail
 * plus optional overrides for the auto-generated `id` and default `title`.
 */
export type PrerequisiteProps<K extends PrerequisiteKind> =
  PrerequisiteStaticDetailMap[K] & {
    title?: string;
    id?: string;
  };

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
