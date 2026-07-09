import type { RWAOperation } from "../parse/index.js";
import type { PreviewOperationOptions } from "../types.js";

import type {
  PoolOperationSimulationResult,
  SimulationInput,
} from "./types.js";

/**
 * Simulates an RWA-factory operation.
 *
 * Not yet implemented: like credit-facade simulation, it requires
 * multicall-aware balance/transfer accounting that the pool simulation does
 * not cover. The signature mirrors {@link simulatePoolOperation} so the
 * {@link simulateOperation} wrapper can delegate uniformly once implemented.
 */
export async function simulateRWAOperation(
  _input: SimulationInput<RWAOperation>,
  _options?: PreviewOperationOptions,
): Promise<PoolOperationSimulationResult> {
  throw new Error("not yet implemented");
}
