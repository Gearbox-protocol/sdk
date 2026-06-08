import type { Address, Hex } from "viem";
import type { OnchainSDK } from "../../sdk/index.js";
import type { OuterFacadeOperation } from "../parse/index.js";

import type {
  OperationSimulationOptions,
  PoolOperationSimulation,
} from "./types.js";

export interface SimulateFacadeOperationInput {
  /** Only `client`/`networkType` are used, so any OnchainSDK works. */
  sdk: OnchainSDK;
  /** Parsed credit-facade operation to simulate. */
  operation: OuterFacadeOperation;
  /** Target contract the calldata is sent to (the credit facade). */
  to: Address;
  /** Raw credit-facade calldata to simulate. */
  calldata: Hex;
  /** Wallet whose balance changes and transfers we track. */
  wallet: Address;
}

/**
 * Simulates a credit-facade operation.
 *
 * Not yet implemented: credit-facade simulation requires multicall-aware
 * balance/transfer accounting that the pool simulation does not cover. The
 * signature mirrors {@link simulatePoolOperation} so the
 * {@link simulateOperation} wrapper can delegate uniformly once implemented.
 */
export async function simulateFacadeOperation(
  _input: SimulateFacadeOperationInput,
  _options?: OperationSimulationOptions,
): Promise<PoolOperationSimulation> {
  throw new Error("not yet implemented");
}
