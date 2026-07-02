import type { Address, Hex } from "viem";
import type { OnchainSDK } from "../../sdk/index.js";
import type { RWAOperation } from "../parse/index.js";

import type {
  OperationSimulationOptions,
  PoolOperationSimulation,
} from "./types.js";

export interface SimulateRWAOperationInput {
  /** Only `client`/`networkType` are used, so any OnchainSDK works. */
  sdk: OnchainSDK;
  /** Parsed RWA-factory operation to simulate. */
  operation: RWAOperation;
  /** Target contract the calldata is sent to (the RWA factory). */
  to: Address;
  /** Raw RWA-factory calldata to simulate. */
  calldata: Hex;
  /** Wallet whose balance changes and transfers we track. */
  wallet: Address;
}

/**
 * Simulates an RWA-factory operation.
 *
 * Not yet implemented: like credit-facade simulation, it requires
 * multicall-aware balance/transfer accounting that the pool simulation does
 * not cover. The signature mirrors {@link simulatePoolOperation} so the
 * {@link simulateOperation} wrapper can delegate uniformly once implemented.
 */
export async function simulateRWAOperation(
  _input: SimulateRWAOperationInput,
  _options?: OperationSimulationOptions,
): Promise<PoolOperationSimulation> {
  throw new Error("not yet implemented");
}
