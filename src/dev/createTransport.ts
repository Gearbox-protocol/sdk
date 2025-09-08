import type {
  HttpTransportConfig,
  Transport,
  WebSocketTransportConfig,
} from "viem";
import { fallback, http, webSocket } from "viem";

import type { NetworkType } from "../sdk/index.js";
import { getChain } from "../sdk/index.js";

export type RpcProvider = "alchemy" | "drpc" | "custom";

export interface ProviderConfig {
  provider: RpcProvider;
  keys: string[];
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

/**
 * Helper method to create viem Transport using API keys of well-known RPC providers and explicit fallback URLs
 * Currently only supports Alchemy
 * @param config
 * @returns
 */
export function createTransport(config: CreateTransportConfig): Transport {
  const { rpcProviders = [], protocol, network, ...rest } = config;

  const rpcUrls = new Map<string, RpcProvider>();
  for (const { provider, keys } of rpcProviders) {
    for (const key of keys) {
      const url = getProviderUrl(provider, network, key, protocol);
      if (url) {
        rpcUrls.set(url, provider);
      }
    }
  }

  const transports = Array.from(rpcUrls.entries()).map(
    ([url, provider], index) =>
      protocol === "http"
        ? http(url, {
            ...(rest as HttpTransportConfig),
            key: `${provider}-${index}`,
            name: `${provider}-${index}`,
          })
        : webSocket(url, {
            ...(rest as WebSocketTransportConfig),
            key: `${provider}-${index}`,
            name: `${provider}-${index}`,
          }),
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
  Hemi: "hemi",
  Lisk: "lisk",
  // TODO: no drpc
  MegaETH: "",
  Etherlink: "",
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
