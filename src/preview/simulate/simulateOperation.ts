import { isPoolOperation, isRWAOperation } from "../parse/index.js";
import type { PreviewOperationOptions } from "../types.js";

import { simulateFacadeOperation } from "./simulateFacadeOperation.js";
import { simulatePoolOperation } from "./simulatePoolOperation.js";
import { simulateRWAOperation } from "./simulateRWAOperation.js";
import type { PoolOperationSimulation, SimulationInput } from "./types.js";

/**
 * Simulates a parsed pool or credit account operation
 */
export async function simulateOperation(
  input: SimulationInput,
  options?: PreviewOperationOptions,
): Promise<PoolOperationSimulation> {
  const { operation } = input;

  if (isPoolOperation(operation)) {
    return simulatePoolOperation({ ...input, operation }, options);
  }

  if (isRWAOperation(operation)) {
    return simulateRWAOperation({ ...input, operation }, options);
  }

  return simulateFacadeOperation({ ...input, operation }, options);
}
