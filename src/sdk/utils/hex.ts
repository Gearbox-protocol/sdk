import type { Hex } from "viem";

/**
 * Returns if two hex strings are equal
 * @param a
 * @param b
 */
export function hexEq(a?: Hex, b?: Hex): boolean {
  return !!a && !!b && a.toLowerCase() === b.toLowerCase();
}
