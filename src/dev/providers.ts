import { z } from "zod/v4";
import { chains, getChain, type NetworkType } from "../sdk/index.js";

export const SUPPORTED_RPC_PROVIDERS = [
  "alchemy",
  "drpc",
  "thirdweb",
  "ankr",
] as const;

export const rpcProvidersSchema = z.enum(SUPPORTED_RPC_PROVIDERS);

export type RpcProvider = z.infer<typeof rpcProvidersSchema>;

export function getRpcProviderUrl(
  provider: RpcProvider,
  network: NetworkType,
  apiKey: string,
  protocol: "http" | "ws" = "http",
): string | undefined {
  switch (provider) {
    case "alchemy":
      return getAlchemyUrl(network, apiKey, protocol);
    case "drpc":
      return getDrpcUrl(network, apiKey, protocol);
    case "thirdweb":
      return getThirdWebUrl(network, apiKey, protocol);
    case "ankr":
      return getAnkrUrl(network, apiKey, protocol);
    default:
      return undefined;
  }
}

export function getAlchemyUrl(
  network: NetworkType,
  apiKey: string,
  protocol: "http" | "ws" = "http",
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
  Monad: "monad-mainnet",
  Hemi: "hemi",
  Lisk: "lisk",
  MegaETH: "megaeth",
  Etherlink: null,
  Plasma: "plasma",
  Somnia: "somnia",
};

const ALCHEMY_DOMAINS: Record<NetworkType, string | null> = {
  Mainnet: "eth-mainnet",
  Arbitrum: "arb-mainnet",
  Optimism: "opt-mainnet",
  Base: "base-mainnet",
  Sonic: "sonic-mainnet",
  Monad: "monad-mainnet",
  Berachain: "berachain-mainnet",
  Avalanche: "avax-mainnet",
  BNB: "bnb-mainnet",
  WorldChain: "worldchain-mainnet",
  MegaETH: "megaeth-mainnet",
  Etherlink: null,
  Hemi: null,
  Lisk: null,
  Plasma: "plasma-mainnet",
  Somnia: null,
};

export function getDrpcUrl(
  network: NetworkType,
  apiKey: string,
  protocol: "http" | "ws" = "http",
): string | undefined {
  const net = DRPC_NETS[network];
  return net ? `${protocol}s://lb.drpc.live/${net}/${apiKey}` : undefined;
}

const ANKR_DOMAINS: Record<NetworkType, string | null> = {
  Arbitrum: "arbitrum",
  Avalanche: "avalanche",
  Base: "base",
  Berachain: null,
  BNB: "bsc",
  Etherlink: "etherlink_mainnet",
  Hemi: null,
  Lisk: null,
  Mainnet: "eth",
  MegaETH: null,
  Monad: "monad_mainnet",
  Optimism: "optimism",
  Plasma: null,
  Sonic: "sonic_mainnet",
  WorldChain: null,
  Somnia: "somnia_mainnet",
};

export function getAnkrUrl(
  network: NetworkType,
  apiKey: string,
  protocol: "http" | "ws" = "http",
): string | undefined {
  const net = ANKR_DOMAINS[network];
  const sep = protocol === "ws" ? "/ws/" : "/";
  return net ? `${protocol}s://rpc.ankr.com/${net}${sep}${apiKey}` : undefined;
}

const THIRDWEB_DOMAINS: Record<NetworkType, string | null> = {
  Arbitrum: chains.Arbitrum.id.toString(),
  Avalanche: chains.Avalanche.id.toString(),
  Base: chains.Base.id.toString(),
  Berachain: chains.Berachain.id.toString(),
  BNB: chains.BNB.id.toString(),
  Etherlink: chains.Etherlink.id.toString(),
  Hemi: chains.Hemi.id.toString(),
  Lisk: chains.Lisk.id.toString(),
  Mainnet: chains.Mainnet.id.toString(),
  MegaETH: chains.MegaETH.id.toString(),
  Monad: chains.Monad.id.toString(),
  Optimism: chains.Optimism.id.toString(),
  Plasma: chains.Plasma.id.toString(),
  Sonic: chains.Sonic.id.toString(),
  WorldChain: chains.WorldChain.id.toString(),
  Somnia: chains.Somnia.id.toString(),
};

export function getThirdWebUrl(
  network: NetworkType,
  apiKey: string,
  protocol: "http" | "ws" = "http",
): string | undefined {
  if (protocol === "ws") {
    return undefined;
  }
  const net = THIRDWEB_DOMAINS[network];
  return `https://${net}.rpc.thirdweb.com/${apiKey}`;
}

export function getErpcKey(
  network: NetworkType,
  projectId?: string,
  urlBase?: string,
): string | undefined {
  if (!projectId || !urlBase) {
    return undefined;
  }
  const chain = getChain(network);
  return `${urlBase}/${projectId}/evm/${chain.id}`;
}

/**
 Non-existent event:
┌────────────┬─────────┬──────┬──────────┬──────┐
│ Network    │ alchemy │ drpc │ thirdweb │ ankr │
├────────────┼─────────┼──────┼──────────┼──────┤
│ Mainnet    │ ∞       │ 10M  │ 1K       │ 10K  │
│ Arbitrum   │ ∞       │ ∞    │ 1K       │ 10K  │
│ Optimism   │ ∞       │ 1M   │ 1K       │ 10K  │
│ Base       │ ∞       │ ∞    │ 1K       │ 10K  │
│ Sonic      │ 10K     │ ∞    │ 1K       │ 10K  │
│ MegaETH    │ ✗       │ ✗    │ ✗        │ ✗    │
│ Monad      │ 1K      │ ✗    │ 1K       │ 1K   │
│ Berachain  │ 10K     │ 300K │ 1K       │ ✗    │
│ Avalanche  │ 10K     │ 5M   │ 1K       │ 10K  │
│ BNB        │ 10K     │ 1M   │ 1K       │ 10K  │
│ WorldChain │ ∞       │ 10M  │ 1K       │ ✗    │
│ Etherlink  │ ✗       │ ✗    │ ✗        │ ✗    │
│ Hemi       │ ✗       │ ∞    │ 1K       │ ✗    │
│ Lisk       │ ✗       │ 5M   │ 1K       │ ✗    │
│ Plasma     │ 10K     │ 100K │ 1K       │ ✗    │
│ Somnia     │ ✗       │ ✗    │ 1K       │ 10K  │
└────────────┴─────────┴──────┴──────────┴──────┘

Rare event (InstanceManager.OwnershipTransferred):

┌────────────┬─────────┬──────┬──────────┬──────┐
│ Network    │ alchemy │ drpc │ thirdweb │ ankr │
├────────────┼─────────┼──────┼──────────┼──────┤
│ Mainnet    │ ∞       │ 10M  │ 1K       │ 10K  │
│ Arbitrum   │ ∞       │ ∞    │ 1K       │ 10K  │
│ Optimism   │ ∞       │ ∞    │ 1K       │ 10K  │
│ Base       │ ∞       │ ∞    │ 1K       │ 10K  │
│ Sonic      │ 10K     │ ∞    │ 1K       │ 10K  │
│ MegaETH    │ ✗       │ ✗    │ ✗        │ ✗    │
│ Monad      │ 1K      │ ✗    │ 1K       │ 1K   │
│ Berachain  │ 10K     │ ∞    │ 1K       │ ✗    │
│ Avalanche  │ 10K     │ 5M   │ 1K       │ 10K  │
│ BNB        │ 10K     │ ∞    │ 1K       │ 10K  │
│ WorldChain │ ∞       │ 1M   │ 1K       │ ✗    │
│ Etherlink  │ ✗       │ ✗    │ ✗        │ ✗    │
│ Hemi       │ ✗       │ ∞    │ 1K       │ ✗    │
│ Lisk       │ ✗       │ 10M  │ 1K       │ ✗    │
│ Plasma     │ 10K     │ 100K │ 1K       │ ✗    │
│ Somnia     │ ✗       │ ✗    │ 1K       │ 10K  │
└────────────┴─────────┴──────┴──────────┴──────┘
 */
