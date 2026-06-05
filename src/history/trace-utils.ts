import {
  type Address,
  decodeAbiParameters,
  getAddress,
  type Hex,
  isAddressEqual,
} from "viem";
import type { CallTrace } from "./internal-types.js";

/**
 * Selector of `CreditManagerV3.execute(bytes)` (`0x09c5eabe`).
 *
 * This is the authoritative marker of an adapter performing an external
 * protocol call: the adapter calls the credit manager's `execute(bytes)`, which
 * forwards the calldata to the credit account, which in turn CALLs the target
 * (protocol) contract. Adapter approvals use a different selector
 * (`execute(address,bytes)` on the credit account), so matching on this
 * selector isolates the real protocol call.
 */
export const EXECUTE_BYTES_SELECTOR = "0x09c5eabe" as const;

/**
 * Finds the shallowest non-reverted `CreditManager.execute(bytes)` call in a
 * trace subtree (breadth-first), or `undefined` if none exists.
 *
 * "Shallowest" matters for account migration: a migrate adapter nests the
 * entire target `openCreditAccount` multicall - including that account's own
 * `execute(bytes)` calls - inside its subtree. The shallowest match is the
 * adapter's own protocol call, not a nested one.
 */
export function findExecuteBytes(node: CallTrace): CallTrace | undefined {
  const queue: CallTrace[] = [node];
  while (queue.length > 0) {
    const current = queue.shift() as CallTrace;
    if (current.error) {
      continue;
    }
    if (current.input.slice(0, 10).toLowerCase() === EXECUTE_BYTES_SELECTOR) {
      return current;
    }
    if (current.calls) {
      queue.push(...current.calls);
    }
  }
  return undefined;
}

/**
 * Finds the first non-reverted CALL in a subtree whose `input` exactly matches
 * `input` (case-insensitive). Used to locate the leaf CALL to the target
 * contract: `execute(bytes)` forwards the calldata unchanged through the credit
 * account proxy DELEGATECALL down to the final CALL to the protocol contract.
 */
export function findCallWithInput(
  node: CallTrace,
  input: Hex,
): CallTrace | undefined {
  if (node.error) {
    return undefined;
  }
  if (
    node.type === "CALL" &&
    node.input.toLowerCase() === input.toLowerCase()
  ) {
    return node;
  }
  if (node.calls) {
    for (const child of node.calls) {
      const found = findCallWithInput(child, input);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

/**
 * Resolves the external protocol call performed by an adapter-level call trace.
 *
 * Locates the shallowest `CreditManager.execute(bytes)`, decodes the forwarded
 * calldata, then finds the leaf CALL whose input matches that calldata to
 * recover the target (protocol) contract address. Returns `undefined` when the
 * subtree does not actually reach an external protocol CALL (e.g. the
 * facade-internal `depositPhantomToken` / `withdrawPhantomToken` accounting
 * calls, which forward calldata but make no external CALL).
 *
 * @param node - direct child node of the upper-level facade call trace
 */
export function resolveProtocolCall(
  node: CallTrace,
): { contract: Address; calldata: Hex } | undefined {
  const executeNode = findExecuteBytes(node);
  if (!executeNode) {
    return undefined;
  }
  const [calldata] = decodeAbiParameters(
    [{ type: "bytes" }],
    `0x${executeNode.input.slice(10)}`,
  );
  const targetCall = findCallWithInput(executeNode, calldata as Hex);
  if (!targetCall) {
    return undefined;
  }
  return { contract: getAddress(targetCall.to), calldata: calldata as Hex };
}

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
