import type { Address, Chain } from "viem";
import { defineChain } from "viem";
import {
  arbitrum,
  avalanche,
  base,
  berachain,
  mainnet,
  megaethTestnet,
  monadTestnet,
  optimism,
  sonic,
} from "viem/chains";
import { z } from "zod";

import { TypedObjectUtils } from "../utils/index.js";

type Curator = "Chaos Labs" | "K3";

export interface GearboxChain extends Chain {
  network: NetworkType;
  defaultMarketConfigurators: Record<Address, Curator>;
  testMarketConfigurators?: Record<Address, Curator>;
  isPublic: boolean;
}

export const SUPPORTED_NETWORKS = [
  "Mainnet",
  "Arbitrum",
  "Optimism",
  "Base",
  "Sonic",
  "MegaETH",
  "Monad",
  "Berachain",
  "Avalanche",
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
        "0x4d427D418342d8CE89a7634c3a402851978B680A": "K3",
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
        "0x01023850b360b88de0d0f84015bbba1eba57fe7e": "Chaos Labs",
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
      isPublic: false,
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
  MegaETH: defineChain({
    ...megaethTestnet,
    network: "MegaETH",
    defaultMarketConfigurators: {},
    isPublic: false,
    // TODO: has no block explorer API
  }),
  Monad: defineChain({
    ...monadTestnet,
    network: "Monad",
    defaultMarketConfigurators: {},
    isPublic: false,
    // TODO: has no block explorer API
  }),
  Berachain: withPublicNode(
    {
      ...berachain,
      network: "Berachain",
      defaultMarketConfigurators: {},
      isPublic: false,
      blockExplorers: {
        default: {
          name: "Berascan",
          url: "https://berascan.com",
          apiUrl: "https://api.berascan.com/api",
        },
      },
    },
    "berachain-rpc",
  ),
  Avalanche: withPublicNode(
    {
      ...avalanche,
      network: "Avalanche",
      defaultMarketConfigurators: {},
      isPublic: false,
    },
    "avalanche-c-chain-rpc",
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
