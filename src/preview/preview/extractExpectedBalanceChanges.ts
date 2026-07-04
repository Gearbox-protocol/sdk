import type { Address } from "viem";
import type { Asset, ParsedCallV2 } from "../../sdk/index.js";

/**
 * Recovers the potential balance changes declared by a router-generated
 * `storeExpectedBalances`/`compareBalances` pair inside a credit-facade
 * multicall
 *
 * @param innerCalls - Raw (already-decoded) inner multicall calls.
 * @returns The declared balance changes, or `undefined` when no
 * `storeExpectedBalances`/`compareBalances` pair is present.
 * @throws When the multicall contains a malformed pair (duplicates, one call
 * without the other, or `compareBalances` before `storeExpectedBalances`).
 */
export function extractExpectedBalanceChanges(
  innerCalls: ParsedCallV2[],
): Asset[] | undefined {
  const storeIndices: number[] = [];
  const compareIndices: number[] = [];
  for (let i = 0; i < innerCalls.length; i++) {
    const name = functionName(innerCalls[i]);
    if (name === "storeExpectedBalances") {
      storeIndices.push(i);
    } else if (name === "compareBalances") {
      compareIndices.push(i);
    }
  }

  if (storeIndices.length === 0 && compareIndices.length === 0) {
    return undefined;
  }
  if (storeIndices.length !== 1 || compareIndices.length !== 1) {
    throw new Error(
      `malformed multicall: expected exactly one storeExpectedBalances/compareBalances pair, got ${storeIndices.length} storeExpectedBalances and ${compareIndices.length} compareBalances calls`,
    );
  }
  if (compareIndices[0] < storeIndices[0]) {
    throw new Error(
      "malformed multicall: compareBalances appears before storeExpectedBalances",
    );
  }

  const store = innerCalls[storeIndices[0]];
  const balanceDeltas = store.rawArgs.balanceDeltas as
    | Array<{ token: Address; amount: bigint }>
    | undefined;
  if (!balanceDeltas) {
    throw new Error(
      "malformed multicall: storeExpectedBalances has no balanceDeltas argument",
    );
  }

  return balanceDeltas.map(({ token, amount }) => ({ token, balance: amount }));
}

function functionName(call: ParsedCallV2): string {
  return call.functionName.split("(")[0];
}
