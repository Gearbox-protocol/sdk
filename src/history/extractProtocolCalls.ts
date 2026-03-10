import type { Hex } from "viem";
import {
  AdapterTraceAlignmentError,
  ProtocolCallNotFoundError,
} from "./errors.js";
import type { CallTrace, ExecuteResult } from "./internal-types.js";
import { findCallTo } from "./trace-utils.js";

/**
 * Extracts calldata sent to target contract for each Execute event.
 *
 * @returns
 */
export function extractProtocolCalls(
  facadeTrace: CallTrace,
  executeResults: ExecuteResult[],
): Hex[] {
  if (executeResults.length === 0) {
    return [];
  }

  // subtraces are the top-level child calls of the facade trace
  // It can be CM, Facade itself, or an adapter call - which is what we're looking for
  const subtraces = facadeTrace.calls ?? [];
  const result: Hex[] = [];
  let subtraceIdx = 0;

  for (let i = 0; i < executeResults.length; i++) {
    const { targetContract } = executeResults[i];
    let found: CallTrace | undefined;

    while (subtraceIdx < subtraces.length && !found) {
      found = findCallTo(subtraces[subtraceIdx], targetContract);
      subtraceIdx++;
    }
    if (!found) {
      throw new ProtocolCallNotFoundError(targetContract, i);
    }
    result.push(found.input);
  }

  if (result.length !== executeResults.length) {
    throw new AdapterTraceAlignmentError(executeResults.length, result.length);
  }

  return result;
}
