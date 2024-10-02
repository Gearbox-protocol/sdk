import type { Chain } from "viem";
import { arbitrum, base, mainnet, optimism } from "viem/chains";

export const SUPPORTED_CHAINS = [
  "Mainnet",
  "Arbitrum",
  "Optimism",
  "Base",
] as const;

export type NetworkType = (typeof SUPPORTED_CHAINS)[number];

export const chains: Record<NetworkType, Chain> = {
  Mainnet: mainnet,
  Arbitrum: arbitrum,
  Optimism: optimism,
  Base: base,
};
