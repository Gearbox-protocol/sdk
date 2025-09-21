import type { HttpTransportConfig, WebSocketTransportConfig } from "viem";

import type { NetworkType } from "../sdk/index.js";

export type RpcProvider = "alchemy" | "drpc" | "custom";

export interface ProviderConfig {
  provider: RpcProvider;
  keys: string[];
  cooldown?: number;
}

export interface CreateTransportURLOptions {
  /**
   * Known providers, first has highest priority
   */
  rpcProviders?: ProviderConfig[];
  network: NetworkType;
}

export type CreateHTTPTransportConfig = {
  protocol: "http";
} & HttpTransportConfig &
  CreateTransportURLOptions;

export type CreateWSTransportConfig = {
  protocol: "ws";
} & WebSocketTransportConfig &
  CreateTransportURLOptions;

export type CreateTransportConfig =
  | CreateHTTPTransportConfig
  | CreateWSTransportConfig;

export function getProviderUrl(
  provider: RpcProvider,
  network: NetworkType,
  apiKey: string,
  protocol: "http" | "ws",
): string | undefined {
  switch (provider) {
    case "alchemy":
      return getAlchemyUrl(network, apiKey, protocol);
    case "drpc":
      return getDrpcUrl(network, apiKey, protocol);
    case "custom": {
      if (!apiKey.startsWith(protocol)) {
        throw new Error(`Custom RPC URL must start with ${protocol}`);
      }
      return apiKey;
    }
  }
}

export function getAlchemyUrl(
  network: NetworkType,
  apiKey: string,
  protocol: "http" | "ws",
): string | undefined {
  const alchemyDomain = ALCHEMY_DOMAINS[network];
  if (!alchemyDomain) {
    return undefined;
  }
  return `${protocol}s://${alchemyDomain}.g.alchemy.com/v2/${apiKey}`;
}

const DRPC_NETS: Record<NetworkType, string | null> = {
  Arbitrum: "arbitrum",
  Base: "base",
  BNB: "bsc",
  Mainnet: "ethereum",
  Optimism: "optimism",
  Sonic: "sonic",
  WorldChain: "worldchain",
  Berachain: "berachain",
  Avalanche: "avalanche",
  Monad: "monad-testnet",
  Hemi: "hemi",
  Lisk: "lisk",
  MegaETH: null,
  Etherlink: null,
  Plasma: "plasma",
};

const ALCHEMY_DOMAINS: Record<NetworkType, string | null> = {
  Mainnet: "eth-mainnet",
  Arbitrum: "arb-mainnet",
  Optimism: "opt-mainnet",
  Base: "base-mainnet",
  Sonic: "sonic-mainnet",
  Monad: "monad-testnet",
  Berachain: "berachain-mainnet",
  Avalanche: "avax-mainnet",
  BNB: "bnb-mainnet",
  WorldChain: "worldchain-mainnet",
  MegaETH: null,
  Etherlink: null,
  Hemi: null,
  Lisk: null,
  Plasma: "plasma-mainnet",
};

export function getDrpcUrl(
  network: NetworkType,
  apiKey: string,
  protocol: "http" | "ws",
): string | undefined {
  const net = DRPC_NETS[network];
  return net ? `${protocol}s://lb.drpc.org/${net}/${apiKey}` : undefined;
}
