import type { Address, Hex } from "viem";
import type { OnchainSDK } from "../../sdk/index.js";
import type { Operation } from "../parse/index.js";

/**
 * Input of the simulation functions, generic over the parsed operation kind
 * so each specialized simulation narrows `operation` while sharing the same
 * shape.
 */
export interface SimulationInput<Op extends Operation = Operation> {
  /** Only `client`/`networkType` are used, so any OnchainSDK works. */
  sdk: OnchainSDK;
  /** Parsed operation to simulate. */
  operation: Op;
  /** Target contract the calldata is sent to. */
  to: Address;
  /** Raw operation calldata to simulate. */
  calldata: Hex;
}

/**
 * Result of simulating a pool operation: the amounts of tokens going in
 * and out. One side comes from calldata, the other from the matching ERC4626
 * preview read.
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
