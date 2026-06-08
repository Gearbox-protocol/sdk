import type { Address, Hex } from "viem";
import type { OnchainSDK } from "../../sdk/index.js";

import { isPoolOperation, type Operation } from "../parse/index.js";

import { simulateFacadeOperation } from "./simulateFacadeOperation.js";
import { simulatePoolOperation } from "./simulatePoolOperation.js";
import type {
  OperationSimulationOptions,
  PoolOperationSimulation,
} from "./types.js";

export interface SimulateOperationInput {
  /** Gearbox SDK instance. */
  sdk: OnchainSDK;
  /** Parsed pool or credit account operation */
  operation: Operation;
  /** Target contract the calldata is sent to. */
  to: Address;
  /** Raw operation calldata to simulate. */
  calldata: Hex;
  /** Wallet whose balance changes and transfers we track. */
  wallet: Address;
}

/**
 * Simulates a parsed pool or credit account operation {@link Operation}
 */
export async function simulateOperation(
  input: SimulateOperationInput,
  options?: OperationSimulationOptions,
): Promise<PoolOperationSimulation> {
  const { operation } = input;

  if (isPoolOperation(operation)) {
    return simulatePoolOperation({ ...input, operation }, options);
  }

  return simulateFacadeOperation({ ...input, operation }, options);
}
