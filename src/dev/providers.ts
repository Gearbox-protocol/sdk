import { chains, type NetworkType } from "../sdk/index.js";

export function getProviderUrl(
  provider: string,
  network: NetworkType,
  apiKey: string,
  protocol: "http" | "ws",
): string | undefined {
  switch (provider) {
    case "alchemy":
      return getAlchemyUrl(network, apiKey, protocol);
    case "drpc":
      return getDrpcUrl(network, apiKey, protocol);
    case "ankr":
      return getAnkrUrl(network, apiKey, protocol);
    case "thirdweb":
      return getThirdWebUrl(network, apiKey, protocol);
    default: {
      if (!apiKey.startsWith(protocol)) {
        throw new Error(
          `generic provider's ${provider} key must start with ${protocol}`,
        );
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
  Monad: "monad_testnet",
  Optimism: "optimism",
  Plasma: null,
  Sonic: "sonic_mainnet",
  WorldChain: null,
};

export function getAnkrUrl(
  network: NetworkType,
  apiKey: string,
  protocol: "http" | "ws",
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
};

export function getThirdWebUrl(
  network: NetworkType,
  apiKey: string,
  protocol: "http" | "ws",
): string | undefined {
  if (protocol === "ws") {
    return undefined;
  }
  const net = THIRDWEB_DOMAINS[network];
  return `https://${net}.rpc.thirdweb.com/${apiKey}`;
}
