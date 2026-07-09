import type { OuterFacadeOperation } from "../parse/index.js";
import type { PreviewOperationOptions } from "../types.js";

import type { PoolOperationSimulation, SimulationInput } from "./types.js";

/**
 * Simulates a credit-facade operation.
 *
 * Not yet implemented: credit-facade simulation requires multicall-aware
 * balance/transfer accounting that the pool simulation does not cover. The
 * signature mirrors {@link simulatePoolOperation} so the
 * {@link simulateOperation} wrapper can delegate uniformly once implemented.
 */
export async function simulateFacadeOperation(
  _input: SimulationInput<OuterFacadeOperation>,
  _options?: PreviewOperationOptions,
): Promise<PoolOperationSimulation> {
  throw new Error("not yet implemented");
}
