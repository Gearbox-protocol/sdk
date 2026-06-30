import type { Address, Hex } from "viem";
import type { OnchainSDK } from "../../sdk/index.js";
import type { ILogger } from "../../sdk/types/logger.js";
import type { PoolOperation } from "../parse/index.js";
import type { PreviewSimulationError } from "./errors.js";

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

export interface PoolOperationSimulationInput {
  /** Only `client`/`networkType` are used, so any OnchainSDK works. */
  sdk: OnchainSDK;
  /** Parsed operation, used to resolve the underlying and pool tokens. */
  operation: PoolOperation;
  /** Target contract the calldata is sent to (the pool). */
  to: Address;
  /** Raw deposit/mint/withdraw/redeem calldata to simulate. */
  calldata: Hex;
  /** Wallet whose balance changes and transfers we track. */
  wallet: Address;
}

export interface OperationSimulationOptions {
  /** Block to simulate at; defaults to latest. */
  blockNumber?: bigint;
  /**
   * Optional logger.
   **/
  logger?: ILogger;
}

/**
 * Successful simulation of a pool operation: the balance changes grouped by
 * watched address. This is the success payload of
 * {@link PoolOperationSimulation} without the `status` discriminant.
 */
export interface PoolOperationSimulationResult {
  /**
   * Balance changes grouped by watched address (wallet, recipient, owner).
   **/
  balanceChanges: AddressBalanceChanges[];
}

/**
 * Outcome of simulating a pool operation. On success it carries a
 * {@link PoolOperationSimulationResult}; on failure it carries a
 * {@link PreviewSimulationError}.
 */
export type PoolOperationSimulation =
  | ({
      status: "success";
    } & PoolOperationSimulationResult)
  | {
      status: "failure";
      error: PreviewSimulationError;
    };
