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

export const PUBLIC_NETWORKS: readonly NetworkType[] = SUPPORTED_NETWORKS;

export function isPublicNetwork(network: NetworkType): boolean {
  return PUBLIC_NETWORKS.includes(network);
}

function withPublicNode(chain: Chain, subdomain: string): Chain {
  return defineChain({
    ...chain,
    rpcUrls: {
      ...chain.rpcUrls,
      publicnode: {
        http: [`https://${subdomain}.publicnode.com`],
        webSocket: [`wss://${subdomain}.publicnode.com`],
      },
    },
  });
}

export const chains: Record<NetworkType, Chain> = {
  Mainnet: withPublicNode(mainnet, "ethereum-rpc"),
  Arbitrum: withPublicNode(arbitrum, "arbitrum-one-rpc"),
  Optimism: withPublicNode(optimism, "optimism-rpc"),
  Base: withPublicNode(base, "base-rpc"),
  Sonic: withPublicNode(
    defineChain({
      ...sonic,
      blockExplorers: {
        default: {
          name: "Sonic Explorer",
          url: "https://sonicscan.org",
          apiUrl: "https://api.sonicscan.org/api",
        },
      },
    }),
    "sonic-rpc",
  ),
};

// TODO: default market configurators
// TODO: isPublic fields for chains

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
