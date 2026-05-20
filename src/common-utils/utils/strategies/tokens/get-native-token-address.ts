import type { Address } from "viem";

const NATIVE_ADDRESS =
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE".toLowerCase() as Address;

export function getNativeTokenAddress() {
  return NATIVE_ADDRESS;
}
