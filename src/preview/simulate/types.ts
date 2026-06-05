import type { Address } from "viem";
import type { TokenTransfer } from "../parse/index.js";

/**
 * Change in an address's balance of a single token over the simulated call.
 * `delta` is `after - before` (negative when the address spent the token).
 */
export interface TokenBalanceChange {
  token: Address;
  before: bigint;
  after: bigint;
  delta: bigint;
}

/**
 * Balance changes for a single watched address (e.g. the wallet or the
 * operation recipient). Keyed purely by address; UI labeling is resolved
 * separately by the presentation layer.
 */
export interface AddressBalanceChanges {
  address: Address;
  changes: TokenBalanceChange[];
}

/** Decoded revert of the simulated transaction. */
export interface SimulationError {
  /** Human-readable revert reason / error name. */
  reason: string;
  /** Original error, kept for debugging. */
  cause?: unknown;
}

/**
 * Outcome of simulating a pool operation. On success it carries the
 * wallet-filtered ERC-20 transfers (to merge into the parsed operation) and the
 * balance changes grouped by watched address; on failure it carries the decoded
 * revert reason.
 */
export type PoolSimulationResult =
  | {
      status: "success";
      transfers: TokenTransfer[];
      balanceChanges: AddressBalanceChanges[];
      gasUsed: bigint;
    }
  | {
      status: "failure";
      error: SimulationError;
    };
