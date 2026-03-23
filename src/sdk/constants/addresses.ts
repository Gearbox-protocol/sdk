import type { Address } from "viem";

export const MULTICALL_ADDRESS: Address =
  "0xcA11bde05977b3631167028862bE2a173976CA11";

/**
 * Address 0x0000000000000000000000000000000000000000
 */
export const ADDRESS_0X0: Address =
  "0x0000000000000000000000000000000000000000";

/**
 * Dummy address to satisfy `0x${string}` typecheck, but fail on `isAddress` check
 */
export const NOT_DEPLOYED = "0xNOT DEPLOYED";
