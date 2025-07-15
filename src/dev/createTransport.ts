import type {
  HttpTransportConfig,
  Transport,
  WebSocketTransportConfig,
} from "viem";
import { fallback, http, webSocket } from "viem";

import type { NetworkType } from "../sdk/index.js";
import { getChain } from "../sdk/index.js";

export type RpcProvider = "alchemy" | "drpc";

export interface ProviderConfig {
  provider: RpcProvider;
  keys: string[];
}

export interface CreateTransportURLOptions {
  /**
   * Explicitly provided RPC URLs, like anvil
   * Have highest priority
   */
  rpcUrls: string[];
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

/**
 * Helper method to create viem Transport using API keys of well-known RPC providers and explicit fallback URLs
 * Currently only supports Alchemy
 * @param config
 * @returns
 */
export function createTransport(config: CreateTransportConfig): Transport {
  const { rpcProviders = [], protocol, network, ...rest } = config;

  // filter out rpc urls that are of other protocol or already include one provider keys
  const allKeys = rpcProviders.flatMap(provider => provider.keys) ?? [];
  const rpcUrls = config.rpcUrls.filter(url => {
    return url.startsWith(protocol) && !allKeys.some(key => url.includes(key));
  });

  for (const { provider, keys } of rpcProviders) {
    for (const key of keys) {
      const url = getProviderUrl(provider, network, key, protocol);
      if (url) {
        rpcUrls.push(url);
      }
    }
  }

  const transports = rpcUrls.map(url =>
    protocol === "http"
      ? http(url, rest as HttpTransportConfig)
      : webSocket(url, rest as WebSocketTransportConfig),
  );
  if (transports.length === 0) {
    throw new Error("no fitting rpc urls found");
  }
  return transports.length > 1 ? fallback(transports) : transports[0];
}

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
  }
}

export function getAlchemyUrl(
  network: NetworkType,
  apiKey: string,
  protocol: "http" | "ws",
): string | undefined {
  const { alchemyDomain } = getChain(network);
  if (!alchemyDomain) {
    return undefined;
  }
  return `${protocol}s://${alchemyDomain}.g.alchemy.com/v2/${apiKey}`;
}

const DRPC_NETS: Record<NetworkType, string> = {
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
  // TODO: no drpc
  MegaETH: "",
  Etherlink: "",
  Hemi: "hemi",
  Lisk: "lisk",
};

export function getDrpcUrl(
  network: NetworkType,
  apiKey: string,
  protocol: "http" | "ws",
): string | undefined {
  const net = DRPC_NETS[network];
  return net
    ? `${protocol}s://lb.drpc.org/ogws?network=${net}&dkey=${apiKey}`
    : undefined;
}
