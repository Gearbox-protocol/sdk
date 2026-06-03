import type { ContractFunctionParameters } from "viem";

import type { AnyPrerequisite, MulticallCallResult } from "./Prerequisite.js";
import type { AnyPrerequisiteResult, PrerequisiteContext } from "./types.js";

/**
 * Verifies all prerequisites in a single resilient multicall.
 *
 * Every prereq contributes its reads to one `multicall({ allowFailure: true })`
 * batch, then resolves its own slice of the response. A read that reverts
 * isolates to that prerequisite (an `error` result) without affecting the
 * others; if the whole round-trip fails (RPC/network), every prerequisite
 * resolves to an `error` carrying that reason.
 */
export async function verifyPrerequisites(
  prereqs: AnyPrerequisite[],
  ctx: PrerequisiteContext,
): Promise<AnyPrerequisiteResult[]> {
  if (prereqs.length === 0) {
    return [];
  }

  const ranges: Array<{ start: number; end: number }> = [];
  const calls: ContractFunctionParameters[] = [];
  for (const prereq of prereqs) {
    const start = calls.length;
    calls.push(...prereq.calls(ctx));
    ranges.push({ start, end: calls.length });
  }

  let results: MulticallCallResult[];
  try {
    results = (await ctx.sdk.client.multicall({
      allowFailure: true,
      contracts: calls,
      // `undefined` lets viem read at `latest`; `blockNumber` is only set for
      // testnet forks pinned to a specific block.
      blockNumber: ctx.blockNumber,
    })) as unknown as MulticallCallResult[];
  } catch (cause) {
    // The whole round-trip failed: surface the error on every prerequisite.
    const error = cause instanceof Error ? cause : new Error(String(cause));
    return prereqs.map(
      (prereq, i) =>
        // Each prereq pairs its own kind with its detail, so the widened
        // `resolve` return is safe to narrow back to the discriminated union.
        prereq.resolve(
          failureSlice(ranges[i].end - ranges[i].start, error),
        ) as AnyPrerequisiteResult,
    );
  }

  return prereqs.map(
    (prereq, i) =>
      prereq.resolve(
        results.slice(ranges[i].start, ranges[i].end),
      ) as AnyPrerequisiteResult,
  );
}

/** Builds a slice of `n` failure entries sharing the same error. */
function failureSlice(n: number, error: Error): MulticallCallResult[] {
  return Array.from({ length: n }, () => ({
    status: "failure" as const,
    error,
  }));
}
