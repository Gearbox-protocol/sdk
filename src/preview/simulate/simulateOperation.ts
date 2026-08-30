import { type SDKReturn, sdkOk } from "../../model/index.js";
import { isPoolOperation, isRWAOperation } from "../parse/index.js";
import type { PreviewOperationOptions } from "../types.js";
import type { PreviewSimulationError } from "./errors.js";

import { simulateFacadeOperation } from "./simulateFacadeOperation.js";
import { simulatePoolOperation } from "./simulatePoolOperation.js";
import { simulateRWAOperation } from "./simulateRWAOperation.js";
import type {
  PoolOperationSimulationResult,
  SimulationInput,
} from "./types.js";

/**
 * Simulates a parsed pool or credit account operation
 */
export async function simulateOperation(
  input: SimulationInput,
  options?: PreviewOperationOptions,
): Promise<SDKReturn<PoolOperationSimulationResult, PreviewSimulationError>> {
  const { operation } = input;

  if (isPoolOperation(operation)) {
    return simulatePoolOperation({ ...input, operation }, options);
  }

  if (isRWAOperation(operation)) {
    return sdkOk(await simulateRWAOperation({ ...input, operation }, options));
  }

  return sdkOk(await simulateFacadeOperation({ ...input, operation }, options));
}
