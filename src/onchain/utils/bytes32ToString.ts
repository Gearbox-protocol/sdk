import type { Hex } from "viem";
import { bytesToString, toBytes } from "viem";

export function bytes32ToString(bytes: Hex): string {
  return bytesToString(toBytes(bytes)).replaceAll("\x00", "");
}
