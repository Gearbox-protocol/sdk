import type { Address } from "viem";

import type { NetworkType } from "../chain";

/**
 * Address 0x0000000000000000000000000000000000000000
 */
export const ADDRESS_0X0: Address =
  "0x0000000000000000000000000000000000000000";

/**
 * Dummy address to satisfy `0x${string}` typecheck, but fail on `isAddress` check
 */
export const NOT_DEPLOYED = "0xNOT DEPLOYED";

/**
 * Well-known USDC token address used to determine NetworkType on testnets with different chain ids
 */
export const USDC: Record<NetworkType, Address> = {
  Mainnet: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  Arbitrum: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  Optimism: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
  Base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
};

export const TIMELOCK: Record<NetworkType, Address> = {
  Mainnet: "0xa133C9A92Fb8dDB962Af1cbae58b2723A0bdf23b",
  Arbitrum: "0x148DD932eCe1155c11006F5650c6Ff428f8D374A",
  Optimism: "0x148DD932eCe1155c11006F5650c6Ff428f8D374A",
  Base: NOT_DEPLOYED,
};
