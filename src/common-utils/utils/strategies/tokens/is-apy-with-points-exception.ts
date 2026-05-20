import type { Address } from "viem";

export const RST_ETH_ADDRESS =
  "0x7a4EffD87C2f3C55CA251080b1343b605f327E3a".toLowerCase() as Address;

const SHOW_APY_FOR_TOKENS_WITH_POINTS: Record<string, Address> = {
  [RST_ETH_ADDRESS]: RST_ETH_ADDRESS,
};

export function isApyWithPointsException(token: Address | undefined): boolean {
  return !!SHOW_APY_FOR_TOKENS_WITH_POINTS[(token || "").toLowerCase()];
}
