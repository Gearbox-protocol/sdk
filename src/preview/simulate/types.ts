import type { Address, Hex } from "viem";
import type { OnchainSDK } from "../../onchain/index.js";
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
   * User -> pool.
   *
   * Deposit/mint: underlying (or zapper input); `withdrawFee` does not apply.
   *
   * Withdraw/redeem: shares burned. On withdraw, `previewWithdraw` inflates
   * that burn for `withdrawFee`; on redeem, the shares from calldata.
   **/
  amountIn: bigint;
  /**
   * Pool -> user.
   *
   * Deposit/mint: shares minted (or zapper output); `withdrawFee` does not apply.
   *
   * Withdraw/redeem: underlying withdrawn. On withdraw, the requested amount;
   * on redeem, `previewRedeem` after `withdrawFee`.
   **/
  amountOut: bigint;
}
