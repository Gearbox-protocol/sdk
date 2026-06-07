import type { Address } from "viem";
import type { ParsedCallV2 } from "../../sdk/index.js";
import type { ExpectedBalanceChange } from "./types.js";

/**
 * Recovers the potential balance changes declared by a router-generated
 * `storeExpectedBalances`/`compareBalances` pair inside a credit-facade
 * multicall.
 *
 * The detection is intentionally limited to the router shape:
 * - `onDemandPriceUpdates` calls are dropped first (they may only appear at the
 *   front of a multicall);
 * - the remaining calls must start with `storeExpectedBalances` and end with
 *   `compareBalances`.
 *
 * When the multicall does not match this shape, `undefined` is returned. On a
 * match, the `BalanceDelta[]` argument of `storeExpectedBalances` is decoded
 * into {@link ExpectedBalanceChange}[] (the `amount` is the signed `int256`
 * delta and may be negative).
 *
 * @param innerCalls - Raw (already-decoded) inner multicall calls.
 * @returns The declared balance changes, or `undefined` when not router-shaped.
 */
export function extractExpectedBalanceChanges(
  innerCalls: ParsedCallV2[],
): ExpectedBalanceChange[] | undefined {
  const calls = innerCalls.filter(
    call => functionName(call) !== "onDemandPriceUpdates",
  );

  if (calls.length === 0) {
    return undefined;
  }

  const first = calls[0];
  const last = calls[calls.length - 1];

  if (
    functionName(first) !== "storeExpectedBalances" ||
    functionName(last) !== "compareBalances"
  ) {
    return undefined;
  }

  const balanceDeltas = first.rawArgs.balanceDeltas as
    | Array<{ token: Address; amount: bigint }>
    | undefined;
  if (!balanceDeltas) {
    return undefined;
  }

  return balanceDeltas.map(({ token, amount }) => ({ token, delta: amount }));
}

function functionName(call: ParsedCallV2): string {
  return call.functionName.split("(")[0];
}
