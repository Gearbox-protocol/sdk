import { type Address, isAddressEqual } from "viem";
import type { CallTrace } from "./internal-types.js";

/**
 * Finds the first non-reverted CALL to `target` anywhere in a trace subtree.
 */
export function findCallTo(
  node: CallTrace,
  target: Address,
): CallTrace | undefined {
  if (node.error) {
    return undefined;
  }
  if (node.type === "CALL" && isAddressEqual(node.to, target)) {
    return node;
  }
  if (node.calls) {
    for (const child of node.calls) {
      const found = findCallTo(child, target);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

/**
 * DFS walk of the call trace tree, collecting non-reverted CALL entries
 * to the given address.
 * Does not recurse into children of matched nodes
 */
export function collectTraces(node: CallTrace, target: Address): CallTrace[] {
  const results: CallTrace[] = [];
  if (node.error) {
    return results;
  }
  if (node.type === "CALL" && isAddressEqual(node.to, target)) {
    results.push(node);
  } else if (node.calls) {
    for (const child of node.calls) {
      results.push(...collectTraces(child, target));
    }
  }
  return results;
}
