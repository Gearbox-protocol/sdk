import type { Address, Chain } from "viem";
import { defineChain } from "viem";
import { arbitrum, base, mainnet, optimism, sonic } from "viem/chains";
import { z } from "zod";

import { TypedObjectUtils } from "../utils/index.js";

export interface GearboxChain extends Chain {
  network: NetworkType;
  defaultMarketConfigurators: Record<Address, string>;
  testMarketConfigurators?: Record<Address, string>;
  isPublic: boolean;
}

export const SUPPORTED_NETWORKS = [
  "Mainnet",
  "Arbitrum",
  "Optimism",
  "Base",
  "Sonic",
] as const;

export const NetworkType = z.enum(SUPPORTED_NETWORKS);

export type NetworkType = z.infer<typeof NetworkType>;

function withPublicNode(chain: GearboxChain, subdomain: string): GearboxChain {
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

export const chains: Record<NetworkType, GearboxChain> = {
  Mainnet: withPublicNode(
    {
      ...mainnet,
      network: "Mainnet",
      defaultMarketConfigurators: {
        "0x354fe9f450F60b8547f88BE042E4A45b46128a06": "Chaos Labs",
      },
      testMarketConfigurators: {
        "0xEc0790B52fBC05c20037695c10f230a37f24DccD": "K3",
      },
      isPublic: true,
    },
    "ethereum-rpc",
  ),
  Arbitrum: withPublicNode(
    {
      ...arbitrum,
      network: "Arbitrum",
      defaultMarketConfigurators: {
        "0x354fe9f450F60b8547f88BE042E4A45b46128a06": "Chaos Labs",
      },
      isPublic: true,
    },
    "arbitrum-one-rpc",
  ),
  Optimism: withPublicNode(
    {
      ...optimism,
      network: "Optimism",
      defaultMarketConfigurators: {
        "0x2a15969CE5320868eb609680751cF8896DD92De5": "Chaos Labs",
      },
      isPublic: true,
    },
    "optimism-rpc",
  ),
  Base: withPublicNode(
    {
      ...base,
      network: "Base",
      defaultMarketConfigurators: {},
      isPublic: true,
    },
    "base-rpc",
  ),
  Sonic: withPublicNode(
    defineChain({
      ...sonic,
      network: "Sonic",
      defaultMarketConfigurators: {
        "0x8FFDd1F1433674516f83645a768E8900A2A5D076": "Chaos Labs",
      },
      isPublic: true,
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

export function getChain(
  chainIdOrNetworkType: number | bigint | NetworkType,
): GearboxChain {
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

export function getNetworkType(chainId: number | bigint): NetworkType {
  for (const [network, chain] of TypedObjectUtils.entries(chains)) {
    if (chain.id === Number(chainId)) {
      return network;
    }
  }

  throw new Error(`Unsupported network with chainId ${chainId}`);
}

export function isSupportedNetwork(
  chainId: number | undefined,
): chainId is number {
  return Object.values(chains).some(c => c.id === chainId);
}

export function isPublicNetwork(
  networkOrChainId: NetworkType | number | bigint,
): boolean {
  return Object.values(chains).some(c => {
    if (typeof networkOrChainId === "string") {
      return c.network === networkOrChainId && c.isPublic;
    }
    return c.id === Number(networkOrChainId) && c.isPublic;
  });
}
