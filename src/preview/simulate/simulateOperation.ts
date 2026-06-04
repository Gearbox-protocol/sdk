import type { Address, Hex } from "viem";
import type { OnchainSDK } from "../../sdk/index.js";

import { isPoolOperation, type Operation } from "../parse/index.js";

import { simulateFacadeOperation } from "./simulateFacadeOperation.js";
import { simulatePoolOperation } from "./simulatePoolOperation.js";
import type { PoolSimulationResult } from "./types.js";

export interface SimulateOperationInput {
  /** Only `client` is used, so any OnchainSDK works. */
  sdk: OnchainSDK;
  /** Parsed operation, used to route to the matching simulation. */
  operation: Operation;
  /** Target contract the calldata is sent to. */
  to: Address;
  /** Raw operation calldata to simulate. */
  calldata: Hex;
  /** Wallet whose balance changes and transfers we track. */
  wallet: Address;
  /** Block to simulate at; defaults to latest. Only set for testnet forks. */
  blockNumber?: bigint;
}

/**
 * Simulates a parsed {@link Operation} by delegating to the matching simulator:
 * pool deposit/redeem operations go to {@link simulatePoolOperation}, and
 * credit-facade operations go to {@link simulateFacadeOperation} (currently a
 * stub). Returns the recovered transfers, balance changes and gas on success,
 * or a decoded revert on failure.
 */
export async function simulateOperation(
  input: SimulateOperationInput,
): Promise<PoolSimulationResult> {
  const { operation } = input;

  if (isPoolOperation(operation)) {
    return simulatePoolOperation({ ...input, operation });
  }

  return simulateFacadeOperation({ ...input, operation });
}
