import type { Chain } from "viem";
import { arbitrum, base, mainnet, optimism } from "viem/chains";

export const SUPPORTED_CHAINS = [
  "Mainnet",
  "Arbitrum",
  "Optimism",
  "Base",
  // "Sonic",
] as const;

export type NetworkType = (typeof SUPPORTED_CHAINS)[number];

export const chains: Record<NetworkType, Chain> = {
  Mainnet: mainnet,
  Arbitrum: arbitrum,
  Optimism: optimism,
  Base: base,
  // Sonic: sonic,
};

const CHAINS_BY_ID: Record<number, NetworkType> = {
  [mainnet.id]: "Mainnet",
  [arbitrum.id]: "Arbitrum",
  [optimism.id]: "Optimism",
  [base.id]: "Base",
  // [sonic.id]: "Sonic",
};

export const getNetworkType = (chainId: number): NetworkType => {
  const chainType = CHAINS_BY_ID[chainId];
  if (chainType) {
    return chainType;
  }

  throw new Error("Unsupported network");
};

export const isSupportedNetwork = (
  chainId: number | undefined,
): chainId is number => chainId !== undefined && !!CHAINS_BY_ID[chainId];
