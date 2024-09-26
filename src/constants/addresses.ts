import type { Address } from "viem";

/**
 * Address 0x0000000000000000000000000000000000000000
 */
export const ADDRESS_0X0: Address =
  "0x0000000000000000000000000000000000000000";

/**
 * Dummy address to satisfy `0x${string}` typecheck, but fail on `isAddress` check
 */
export const NOT_DEPLOYED = "0xNOT DEPLOYED";
