import { type Chain, defineChain } from "viem";
import { arbitrum, base, mainnet, optimism, sonic } from "viem/chains";
import { z } from "zod";

export const SUPPORTED_NETWORKS = [
  "Mainnet",
  "Arbitrum",
  "Optimism",
  "Base",
  "Sonic",
] as const;

export const NetworkType = z.enum(SUPPORTED_NETWORKS);

export type NetworkType = z.infer<typeof NetworkType>;

export const chains: Record<NetworkType, Chain> = {
  Mainnet: mainnet,
  Arbitrum: arbitrum,
  Optimism: optimism,
  Base: base,
  Sonic: defineChain({
    ...sonic,
    blockExplorers: {
      default: {
        name: "Sonic Explorer",
        url: "https://sonicscan.org",
        apiUrl: "https://api.sonicscan.org/api",
      },
    },
  }),
};

const CHAINS_BY_ID: Record<number, NetworkType> = {
  [mainnet.id]: "Mainnet",
  [arbitrum.id]: "Arbitrum",
  [optimism.id]: "Optimism",
  [base.id]: "Base",
  [sonic.id]: "Sonic",
};

export function getChain(
  chainIdOrNetworkType: number | bigint | NetworkType,
): Chain {
  const network =
    typeof chainIdOrNetworkType === "string"
      ? chainIdOrNetworkType
      : getNetworkType(Number(chainIdOrNetworkType));
  const chain = chains[network];
  if (!chain) {
    throw new Error("Unsupported network");
  }
  return chain;
}

export function getNetworkType(chainId: number): NetworkType {
  const chainType = CHAINS_BY_ID[chainId];
  if (chainType) {
    return chainType;
  }

  throw new Error("Unsupported network");
}

export function isSupportedNetwork(
  chainId: number | undefined,
): chainId is number {
  return chainId !== undefined && !!CHAINS_BY_ID[chainId];
}
