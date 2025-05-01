import { fallback, http, type Transport, webSocket } from "viem";

import { getChain, type NetworkType } from "../sdk/index.js";

export interface CreateTransportConfig {
  rpcUrls: string[];
  alchemyKeys: string[];
  protocol: "http" | "ws";
  network: NetworkType;
}

/**
 * Helper method to create viem Transport using API keys of well-known RPC providers and explicit fallback URLs
 * Currently only supports Alchemy
 * @param config
 * @returns
 */
export function createTransport(config: CreateTransportConfig): Transport {
  const { alchemyKeys, protocol, network } = config;
  // filter out rpc urls that are of other protocol or already include one of alchemy keys
  const rpcUrls = config.rpcUrls.filter(url => {
    return (
      url.startsWith(protocol) && !alchemyKeys.some(key => url.includes(key))
    );
  });
  const { alchemyDomain } = getChain(network);
  if (alchemyDomain) {
    rpcUrls.unshift(
      ...alchemyKeys.map(key => getAlchemyUrl(alchemyDomain, key, protocol)),
    );
  }
  const transports = rpcUrls.map(url =>
    protocol === "http" ? http(url) : webSocket(url),
  );
  if (transports.length === 0) {
    throw new Error("no fitting rpc urls found");
  }
  return transports.length > 1 ? fallback(transports) : transports[0];
}

export function getAlchemyUrl(
  domain: string,
  apiKey: string,
  protocol: "http" | "ws",
): string {
  return protocol === "http"
    ? getAlchemyHttpUrl(domain, apiKey)
    : getAlchemyWsUrl(domain, apiKey);
}

export function getAlchemyHttpUrl(domain: string, apiKey: string): string {
  return `https://${domain}.g.alchemy.com/v2/${apiKey}`;
}

export function getAlchemyWsUrl(domain: string, apiKey: string): string {
  return `wss://${domain}.g.alchemy.com/v2/${apiKey}`;
}
