import type { Address, Hex } from "viem";
import type { OnchainSDK } from "../../sdk/index.js";
import type { ILogger } from "../../sdk/types/logger.js";
import type { PoolOperation } from "../parse/index.js";
import type { PreviewSimulationError } from "./errors.js";

export interface PoolOperationSimulationInput {
  /** Only `client`/`networkType` are used, so any OnchainSDK works. */
  sdk: OnchainSDK;
  /** Parsed operation, used to resolve the underlying and pool tokens. */
  operation: PoolOperation;
  /** Target contract the calldata is sent to (the pool). */
  to: Address;
  /** Raw deposit/mint/withdraw/redeem calldata to simulate. */
  calldata: Hex;
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
 * Successful simulation of a pool operation: the amounts of tokens going in
 * and out. One side comes from calldata, the other from the matching ERC4626
 * preview read. This is the success payload of {@link PoolOperationSimulation}
 * without the `status` discriminant.
 */
export interface PoolOperationSimulationResult {
  /**
   * Amount of tokens going from the user to the pool (underlying or zapper
   * input token for deposit/mint, pool shares for withdraw/redeem).
   **/
  amountIn: bigint;
  /**
   * Amount of tokens going from the pool to the user (pool shares or zapper
   * output token for deposit/mint, underlying for withdraw/redeem).
   **/
  amountOut: bigint;
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
