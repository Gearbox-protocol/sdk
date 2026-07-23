import {
  type Abi,
  type Address,
  decodeFunctionData,
  type Hex,
  slice,
} from "viem";
import { json_stringify } from "../../src/sdk/index.js";
import { INNER_ABIS, OUTER_ABIS } from "./abiRegistry.js";
import type { DecodedCall, DecodedTx, TxDumpTransaction } from "./types.js";

interface MultiCallLike {
  target: Address;
  callData: Hex;
}

function tryDecode(
  abis: Abi[],
  data: Hex,
): { functionName: string; args: readonly unknown[] } | undefined {
  for (const abi of abis) {
    try {
      const { functionName, args } = decodeFunctionData({ abi, data });
      return { functionName, args: args ?? [] };
    } catch {
      // try next abi
    }
  }
  return undefined;
}

function formatArgs(args: readonly unknown[], maxLen = 300): string {
  const s = json_stringify(args);
  return s.length > maxLen ? `${s.slice(0, maxLen)}…` : s;
}

function isMultiCallLike(v: unknown): v is MultiCallLike {
  return (
    !!v &&
    typeof v === "object" &&
    "target" in v &&
    "callData" in v &&
    typeof (v as MultiCallLike).target === "string" &&
    typeof (v as MultiCallLike).callData === "string" &&
    (v as MultiCallLike).callData.startsWith("0x")
  );
}

/**
 * Extracts MultiCall-like arrays nested anywhere in decoded args.
 */
function findMultiCallArrays(args: readonly unknown[]): MultiCallLike[][] {
  const found: MultiCallLike[][] = [];
  for (const arg of args) {
    if (Array.isArray(arg) && arg.length > 0 && arg.every(isMultiCallLike)) {
      found.push(arg);
    }
  }
  return found;
}

function decodeCall(
  target: Address,
  data: Hex,
  abis: Abi[],
  depth = 0,
): DecodedCall {
  const selector = slice(data, 0, 4) as Hex;
  const decoded = tryDecode(abis, data);
  if (!decoded) {
    return {
      target,
      selector,
      functionName: `<unknown selector ${selector}>`,
      args: "",
    };
  }

  const children: DecodedCall[] = [];
  // Recurse into nested MultiCall arrays (depth-limited to avoid runaway)
  if (depth < 4) {
    for (const calls of findMultiCallArrays(decoded.args)) {
      for (const call of calls) {
        children.push(
          decodeCall(call.target, call.callData, INNER_ABIS, depth + 1),
        );
      }
    }
  }

  return {
    target,
    selector,
    functionName: decoded.functionName,
    args: formatArgs(decoded.args),
    ...(children.length > 0 ? { children } : {}),
  };
}

/**
 * Decodes a top-level transaction: outer entrypoint + nested multicall tree.
 */
export function decodeTx(tx: TxDumpTransaction): DecodedTx {
  const outer = decodeCall(tx.to, tx.data, [...OUTER_ABIS, ...INNER_ABIS], 0);
  if (outer.functionName.startsWith("<unknown")) {
    throw new Error(
      `cannot decode outer calldata of tx "${tx.label}" to ${tx.to} (selector ${outer.selector})`,
    );
  }
  return {
    label: tx.label,
    to: tx.to,
    outer,
    calls: outer.children ?? [],
  };
}

/**
 * Pretty-prints a decoded transaction tree.
 */
export function formatDecodedTx(tx: DecodedTx, indent = ""): string {
  const lines: string[] = [];
  lines.push(
    `${indent}${tx.label}: ${tx.outer.functionName} @ ${tx.to} (${tx.calls.length} inner calls)`,
  );
  const walk = (calls: DecodedCall[], prefix: string) => {
    for (let i = 0; i < calls.length; i++) {
      const c = calls[i];
      lines.push(`${prefix}[${i}] ${c.functionName} @ ${c.target}`);
      if (c.args) {
        lines.push(`${prefix}      args: ${c.args}`);
      }
      if (c.children?.length) {
        walk(c.children, `${prefix}  `);
      }
    }
  };
  walk(tx.calls, `${indent}  `);
  return lines.join("\n");
}
