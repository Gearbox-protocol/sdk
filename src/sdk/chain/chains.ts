import type { Address, Chain } from "viem";
import { defineChain } from "viem";
import {
  arbitrum,
  avalanche,
  base,
  berachain,
  bsc,
  etherlink,
  hemi,
  lisk,
  mainnet,
  megaeth,
  monad,
  optimism,
  plasma,
  sonic,
  worldchain,
} from "viem/chains";
import { z } from "zod/v4";
import { TypedObjectUtils } from "../utils/mappers.js";

export type Curator =
  | "Chaos Labs"
  | "K3"
  | "cp0x"
  | "Re7"
  | "Invariant Group"
  | "Tulipa"
  | "M11 Credit"
  | "kpk"
  | "Hyperithm"
  | "Edge UltraYield"
  | "TelosC";

export interface GearboxChain extends Chain {
  network: NetworkType;
  defaultMarketConfigurators: Record<Address, Curator>;
  testMarketConfigurators?: Record<Address, Curator>;
  isPublic: boolean;
  /**
   * Pair of address and ERC-20 symbol of a well-known token on the chain
   * This can be used to uniquely identify the chain from arbitrary RPC endpoint
   *
   * It must be guaranteed that under that address no contract that returns the same symbol is deployed on any other network
   *
   * @see {detectNetwork}
   */
  wellKnownToken: {
    address: Address;
    symbol: string;
  };
  /**
   * Block number when Gearbox address provider was deployed
   */
  firstBlock?: bigint;
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
  "BNB",
  "WorldChain",
  "Etherlink",
  "Hemi",
  "Lisk",
  "Plasma",
  "Somnia",
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
        "0x4d427D418342d8CE89a7634c3a402851978B680A": "K3",
        "0xc168343c791d56dd1da4b4b8b0cc1c1ec1a16e6b": "cp0x",
        "0x3b56538833fc02f4f0e75609390f26ded0c32e42": "Re7",
        "0x7a133fbd01736fd076158307c9476cc3877f1af5": "Invariant Group",
        "0x09d8305F49374AEA6A78aF6C996df2913e8f3b19": "Tulipa",
        "0x1b265b97eb169fb6668e3258007c3b0242c7bdbe": "kpk",
        "0x9dddd1b9ce0ac8aa0c80e4ec141600b9bf0101c3": "Edge UltraYield",
      },
      testMarketConfigurators: {
        "0x99df7330bf42d596af2e9d9836d4fc2077c574aa": "M11 Credit",
      },
      isPublic: true,
      wellKnownToken: {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        symbol: "USDC",
      },
      firstBlock: 18433056n, // AddressProvderV3 0x9ea7b04Da02a5373317D745c1571c84aaD03321D
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
      wellKnownToken: {
        address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        symbol: "USDC",
      },
      firstBlock: 184650310n,
    },
    "arbitrum-one-rpc",
  ),
  Optimism: withPublicNode(
    {
      ...optimism,
      network: "Optimism",
      defaultMarketConfigurators: {
        "0x2a15969CE5320868eb609680751cF8896DD92De5": "Chaos Labs",
        "0x9dddd1b9ce0ac8aa0c80e4ec141600b9bf0101c3": "Edge UltraYield",
      },
      isPublic: true,
      wellKnownToken: {
        address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
        symbol: "USDC",
      },
      firstBlock: 118410666n,
    },
    "optimism-rpc",
  ),
  Base: withPublicNode(
    {
      ...base,
      network: "Base",
      defaultMarketConfigurators: {},
      isPublic: false,
      wellKnownToken: {
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        symbol: "USDC",
      },
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
      wellKnownToken: {
        address: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
        symbol: "USDC",
      },

      firstBlock: 9779380n,
    }),
    "sonic-rpc",
  ),
  MegaETH: defineChain({
    ...megaeth,
    network: "MegaETH",
    defaultMarketConfigurators: {},
    isPublic: false,
    wellKnownToken: {
      address: "0xFAfDdbb3FC7688494971a79cc65DCa3EF82079E7",
      symbol: "USDm",
    },
  }),
  // NOTE: Monad chain configs should be updated once the public mainnet is available
  Monad: defineChain({
    ...monad,
    blockExplorers: {
      default: {
        name: "Monadscan",
        url: "https://monadscan.com/",
      },
    },
    network: "Monad",
    defaultMarketConfigurators: {
      "0x16956912813ab9a38d95730b52a8cf53e860a7c5": "Tulipa",
      "0x7c6ee1bf9c1eb3ee55bdbdc1e8d0317aab718e0a": "Edge UltraYield",
    },
    isPublic: true,
    wellKnownToken: {
      address: "0xe7cd86e13AC4309349F30B3435a9d337750fC82D",
      symbol: "USDT0",
    },
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
      wellKnownToken: {
        address: "0x549943e04f40284185054145c6e4e9568c1d3241",
        symbol: "USDC.e",
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
      wellKnownToken: {
        address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
        symbol: "USDC",
      },
    },
    "avalanche-c-chain-rpc",
  ),
  BNB: withPublicNode(
    {
      ...bsc,
      network: "BNB",
      defaultMarketConfigurators: {
        "0x19037a281025b83fa37e3264b77af523ff87a3a4": "Chaos Labs",
        "0x92dc4ee43e9b207e16fbf3fd1a6933563c0a0d35": "Re7",
      },
      testMarketConfigurators: {},
      isPublic: true,
      wellKnownToken: {
        address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
        symbol: "USDC",
      },
      firstBlock: 48761804n,
    },
    "bsc-rpc",
  ),
  WorldChain: defineChain({
    ...worldchain,
    network: "WorldChain",
    defaultMarketConfigurators: {},
    isPublic: false,
    wellKnownToken: {
      address: "0x79a02482a880bce3f13e09da970dc34db4cd24d1",
      symbol: "USDC",
    },
    // TODO: has no block explorer API
  }),
  Etherlink: defineChain({
    ...etherlink,
    network: "Etherlink",
    defaultMarketConfigurators: {
      "0x577424f0e6f50db668cc1bc76babb87e36732291": "Re7",
    },
    isPublic: true,
    wellKnownToken: {
      address: "0x796Ea11Fa2dD751eD01b53C372fFDB4AAa8f00F9",
      symbol: "USDC",
    },
    firstBlock: 16672969n,
    // TODO: has no block explorer API
  }),
  Hemi: defineChain({
    ...hemi,
    network: "Hemi",
    defaultMarketConfigurators: {
      "0xc9961b8a0c763779690577f2c76962c086af2fe3": "Invariant Group",
    },
    isPublic: true,
    wellKnownToken: {
      address: "0xad11a8BEb98bbf61dbb1aa0F6d6F2ECD87b35afA",
      symbol: "USDC.e",
    },
    contracts: {
      multicall3: {
        address: "0xcA11bde05977b3631167028862bE2a173976CA11",
        blockCreated: 484490,
      },
    },
  }),
  Lisk: defineChain({
    ...lisk,
    network: "Lisk",
    defaultMarketConfigurators: {
      "0x25778dbf0e56b7feb8358c4aa2f6f9e19a1c145a": "Re7",
    },
    isPublic: true,
    wellKnownToken: {
      address: "0xF242275d3a6527d877f2c927a82D9b057609cc71",
      symbol: "USDC.e",
    },
  }),
  Plasma: defineChain({
    ...plasma,
    network: "Plasma",
    defaultMarketConfigurators: {
      "0x7a133fbd01736fd076158307c9476cc3877f1af5": "Invariant Group",
      "0x4bce62622be621ce036691de98afcab0e41a77a3": "Edge UltraYield",
      "0xce1cf71a28837daaa7b92d00ca4ef2fd649c2a67": "Hyperithm",
      "0x9655f82b585b11cee8a05576ed8efcf755cec04b": "TelosC",
    },
    isPublic: true,
    wellKnownToken: {
      address: "0x5d72a9d9a9510cd8cbdba12ac62593a58930a948",
      symbol: "aPlaUSDT0",
    },
    contracts: {
      multicall3: {
        address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      },
    },
  }),
  Somnia: defineChain({
    id: 5031,
    name: "Somnia",
    nativeCurrency: {
      name: "Somnia",
      symbol: "SOMI",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ["https://api.infra.mainnet.somnia.network"],
      },
    },
    blockExplorers: {
      default: {
        name: "Somnia Explorer",
        url: "https://explorer.somnia.network",
      },
    },
    contracts: {
      multicall3: {
        address: "0x5e44F178E8cF9B2F5409B6f18ce936aB817C5a11",
        blockCreated: 38516341,
      },
    },
    blockTime: 200,
    network: "Somnia",
    defaultMarketConfigurators: {
      "0x1ca8b92aa7233a9f8f7ba031ac45c878141adff0": "Invariant Group",
    },
    isPublic: true,
    wellKnownToken: {
      address: "0x67B302E35Aef5EEE8c32D934F5856869EF428330",
      symbol: "USDT",
    },
  }),
};

const networkByChainId = Object.values(chains).reduce<
  Record<number, NetworkType>
>((acc, chain) => {
  acc[chain.id] = chain.network;
  return acc;
}, {});

export function getChain(
  chainIdOrNetworkType: number | bigint | NetworkType,
): GearboxChain {
  const network =
    typeof chainIdOrNetworkType === "string"
      ? chainIdOrNetworkType
      : getNetworkType(Number(chainIdOrNetworkType));
  const chain = chains[network];
  if (!chain) {
    throw new Error(`Unsupported network: ${network}`);
  }
  return chain;
}

export function getNetworkType(chainId: number | bigint): NetworkType {
  const network = networkByChainId[Number(chainId)];
  if (!network) throw new Error(`Unsupported network with chainId ${chainId}`);
  return network;
}

export function isSupportedNetwork(
  chainId: number | undefined,
): chainId is number {
  if (chainId === undefined) return false;
  return !!networkByChainId[chainId];
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

/**
 * Tries to find curator name by market configurator address among all default and test market configurators
 * @param marketConfigurator
 * @param network
 * @returns
 */
export function getCuratorName(
  marketConfigurator: Address,
  network?: NetworkType,
): Curator | undefined {
  const chainz = network ? [chains[network]] : Object.values(chains);
  for (const c of chainz) {
    for (const [a, curator] of TypedObjectUtils.entries({
      ...c.defaultMarketConfigurators,
      ...c.testMarketConfigurators,
    })) {
      if (a.toLowerCase() === marketConfigurator.toLowerCase()) {
        return curator;
      }
    }
  }
  return undefined;
}

/**
 * Finds market configurator address by curator name
 * @param curator
 * @param network
 * @returns
 */
export function findCuratorMarketConfigurator(
  curator: Curator,
  network: NetworkType,
): Address | undefined {
  const { defaultMarketConfigurators, testMarketConfigurators } =
    chains[network];
  const all = { ...defaultMarketConfigurators, ...testMarketConfigurators };
  for (const [a, c] of TypedObjectUtils.entries(all)) {
    if (c === curator) {
      return a;
    }
  }
  return undefined;
}
