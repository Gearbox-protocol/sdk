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
  somnia,
  sonic,
  worldchain,
} from "viem/chains";
import { z } from "zod/v4";
import { TypedObjectUtils } from "../utils/mappers.js";

/**
 * Known curator names that manage Gearbox markets.
 *
 **/
export type Curator =
  | "Chaos Labs"
  | "K3"
  | "cp0x"
  | "Re7"
  | "Invariant Group"
  | "Tulipa"
  | "M11 Credit"
  | "KPK"
  | "Hyperithm"
  | "UltraYield"
  | "TelosC"
  | "Gami Labs"
  | "Securitize"
  | "Testnet Curator"; // without governor, for midas

/**
 * Extended viem {@link Chain} with Gearbox-specific metadata.
 *
 * Every supported network is represented by a `GearboxChain` instance in
 * the {@link chains} record.
 **/
export interface GearboxChain extends Chain {
  /**
   * Gearbox network type label (e.g. `"Mainnet"`, `"Arbitrum"`).
   **/
  network: NetworkType;
  /**
   * Market configurator addresses operated by known curators on this chain.
   **/
  defaultMarketConfigurators: Record<Address, Curator>;
  /**
   * Known RWA factory addresses on this chain
   */
  rwaFactories: Address[];
  /**
   * Market configurators used in test/staging environments.
   **/
  testMarketConfigurators?: Record<Address, Curator>;
  /**
   * Whether this chain is production-ready
   **/
  isPublic: boolean;
  /**
   * A well-known ERC-20 token that uniquely identifies this chain.
   *
   * Used by {@link detectNetwork} to determine which chain an arbitrary
   * RPC endpoint is connected to.
   **/
  wellKnownToken: {
    address: Address;
    symbol: string;
  };
  /**
   * Block number when the Gearbox address provider was deployed.
   **/
  firstBlock?: bigint;
  /**
   * Default read-only calls gas limit for this chain.
   */
  gasLimit: bigint;
}

/**
 * Tuple of all network labels the SDK can work with.
 **/
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

/**
 * Zod schema for validating/parsing network type strings.
 **/
export const NetworkType = z.enum(SUPPORTED_NETWORKS);

/**
 * All supported Gearbox network labels
 **/
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

/**
 * Pre-configured {@link GearboxChain} instances for every supported network.
 **/
export const chains: Record<NetworkType, GearboxChain> = {
  Mainnet: withPublicNode(
    {
      ...mainnet,
      network: "Mainnet",
      defaultMarketConfigurators: {
        "0xc168343c791d56dd1da4b4b8b0cc1c1ec1a16e6b": "cp0x",
        "0x3b56538833fc02f4f0e75609390f26ded0c32e42": "Re7",
        "0x7a133fbd01736fd076158307c9476cc3877f1af5": "Invariant Group",
        "0x09d8305F49374AEA6A78aF6C996df2913e8f3b19": "Tulipa",
        "0x1b265b97eb169fb6668e3258007c3b0242c7bdbe": "KPK",
        "0x9dddd1b9ce0ac8aa0c80e4ec141600b9bf0101c3": "UltraYield",
        "0x601067eba24bb5b558a184fc082525637e96a42d": "Gami Labs",
      },
      testMarketConfigurators: {
        "0x99df7330bf42d596af2e9d9836d4fc2077c574aa": "M11 Credit",
        "0x610627d8d01a413bdd9b0a0b60070da7dd1e54ad": "Securitize",
        "0xa770ce584adb6491a2138da6eaec33243bdcd248": "Testnet Curator", // without governor, for midas
      },
      rwaFactories: [
        "0xc6f7b95f6fb8394541d9ac8b0abc94bf6e84f703", // Securitize
      ],
      isPublic: true,
      wellKnownToken: {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        symbol: "USDC",
      },
      firstBlock: 22358644n,
      gasLimit: 550_000_000n,
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
      rwaFactories: [] as Address[],
      isPublic: true,
      wellKnownToken: {
        address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        symbol: "USDC",
      },
      firstBlock: 184650310n,
      gasLimit: 550_000_000n,
    },
    "arbitrum-one-rpc",
  ),
  Optimism: withPublicNode(
    {
      ...optimism,
      network: "Optimism",
      defaultMarketConfigurators: {
        "0x2a15969CE5320868eb609680751cF8896DD92De5": "Chaos Labs",
        "0x9dddd1b9ce0ac8aa0c80e4ec141600b9bf0101c3": "UltraYield",
      },
      rwaFactories: [] as Address[],
      isPublic: true,
      wellKnownToken: {
        address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
        symbol: "USDC",
      },
      firstBlock: 118410666n,
      gasLimit: 550_000_000n,
    },
    "optimism-rpc",
  ),
  Base: withPublicNode(
    {
      ...base,
      network: "Base",
      defaultMarketConfigurators: {},
      rwaFactories: [] as Address[],
      isPublic: false,
      wellKnownToken: {
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        symbol: "USDC",
      },
      gasLimit: 550_000_000n,
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
      rwaFactories: [] as Address[],
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
      gasLimit: 550_000_000n,
      firstBlock: 9779380n,
    }),
    "sonic-rpc",
  ),
  MegaETH: defineChain({
    ...megaeth,
    network: "MegaETH",
    defaultMarketConfigurators: {},
    rwaFactories: [] as Address[],
    isPublic: false,
    wellKnownToken: {
      address: "0xFAfDdbb3FC7688494971a79cc65DCa3EF82079E7",
      symbol: "USDm",
    },
    gasLimit: 550_000_000n,
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
      "0x7c6ee1bf9c1eb3ee55bdbdc1e8d0317aab718e0a": "UltraYield",
    },
    rwaFactories: [] as Address[],
    isPublic: true,
    wellKnownToken: {
      address: "0xe7cd86e13AC4309349F30B3435a9d337750fC82D",
      symbol: "USDT0",
    },
    firstBlock: 34650262n,
    gasLimit: 150_000_000n,
  }),
  Berachain: withPublicNode(
    {
      ...berachain,
      network: "Berachain",
      defaultMarketConfigurators: {},
      rwaFactories: [] as Address[],
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
      gasLimit: 550_000_000n,
    },
    "berachain-rpc",
  ),
  Avalanche: withPublicNode(
    {
      ...avalanche,
      network: "Avalanche",
      defaultMarketConfigurators: {},
      rwaFactories: [] as Address[],
      isPublic: false,
      wellKnownToken: {
        address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
        symbol: "USDC",
      },
      gasLimit: 550_000_000n,
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
      rwaFactories: [] as Address[],
      isPublic: true,
      wellKnownToken: {
        address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
        symbol: "USDC",
      },
      firstBlock: 48761804n,
      gasLimit: 550_000_000n,
    },
    "bsc-rpc",
  ),
  WorldChain: defineChain({
    ...worldchain,
    network: "WorldChain",
    defaultMarketConfigurators: {},
    rwaFactories: [] as Address[],
    isPublic: false,
    wellKnownToken: {
      address: "0x79a02482a880bce3f13e09da970dc34db4cd24d1",
      symbol: "USDC",
    },
    // TODO: has no block explorer API
    gasLimit: 550_000_000n,
  }),
  Etherlink: defineChain({
    ...etherlink,
    network: "Etherlink",
    defaultMarketConfigurators: {
      "0x577424f0e6f50db668cc1bc76babb87e36732291": "Re7",
    },
    rwaFactories: [] as Address[],
    isPublic: true,
    wellKnownToken: {
      address: "0x796Ea11Fa2dD751eD01b53C372fFDB4AAa8f00F9",
      symbol: "USDC",
    },
    firstBlock: 16672963n,
    gasLimit: 550_000_000n,
  }),
  Hemi: defineChain({
    ...hemi,
    network: "Hemi",
    defaultMarketConfigurators: {
      "0xc9961b8a0c763779690577f2c76962c086af2fe3": "Invariant Group",
    },
    rwaFactories: [] as Address[],
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
    gasLimit: 550_000_000n,
  }),
  Lisk: defineChain({
    ...lisk,
    network: "Lisk",
    defaultMarketConfigurators: {
      "0x25778dbf0e56b7feb8358c4aa2f6f9e19a1c145a": "Re7",
    },
    rwaFactories: [] as Address[],
    isPublic: true,
    wellKnownToken: {
      address: "0xF242275d3a6527d877f2c927a82D9b057609cc71",
      symbol: "USDC.e",
    },
    gasLimit: 550_000_000n,
  }),
  Plasma: defineChain({
    ...plasma,
    network: "Plasma",
    defaultMarketConfigurators: {
      "0x7a133fbd01736fd076158307c9476cc3877f1af5": "Invariant Group",
      "0x4bce62622be621ce036691de98afcab0e41a77a3": "UltraYield",
      "0xce1cf71a28837daaa7b92d00ca4ef2fd649c2a67": "Hyperithm",
      "0x9655f82b585b11cee8a05576ed8efcf755cec04b": "TelosC",
    },
    rwaFactories: [] as Address[],
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
    firstBlock: 670913n,
    gasLimit: 550_000_000n,
  }),
  Somnia: defineChain({
    ...somnia,
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
    rwaFactories: [] as Address[],
    isPublic: true,
    wellKnownToken: {
      address: "0x67B302E35Aef5EEE8c32D934F5856869EF428330",
      symbol: "USDT",
    },
    firstBlock: 147687380n,
    gasLimit: 550_000_000n,
  }),
};

const networkByChainId = Object.values(chains).reduce<
  Record<number, NetworkType>
>((acc, chain) => {
  acc[chain.id] = chain.network;
  return acc;
}, {});

/**
 * Returns the {@link GearboxChain} for a given chain ID or network type label.
 *
 * @param chainIdOrNetworkType - Numeric chain ID, bigint chain ID, or a {@link NetworkType} string.
 * @throws If the chain ID / network type is not supported.
 **/
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

/**
 * Resolves a numeric chain ID to its {@link NetworkType} label.
 *
 * @param chainId - Numeric or bigint chain ID.
 * @throws If the chain ID does not correspond to a supported network.
 **/
export function getNetworkType(chainId: number | bigint): NetworkType {
  const network = networkByChainId[Number(chainId)];
  if (!network) throw new Error(`Unsupported network with chainId ${chainId}`);
  return network;
}

/**
 * Type guard that checks whether a chain ID belongs to a supported Gearbox network.
 *
 * @param chainId - Numeric chain ID, or `undefined`.
 **/
export function isSupportedNetwork(
  chainId: number | undefined,
): chainId is number {
  if (chainId === undefined) return false;
  return !!networkByChainId[chainId];
}

/**
 * Returns `true` if the given network or chain ID has a publicly deployed Gearbox instance.
 *
 * @param networkOrChainId - {@link NetworkType} string or numeric chain ID.
 **/
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
 * Looks up the {@link Curator} name for a market configurator address.
 *
 * Searches default and test market configurators across all chains, or
 * a single network if provided.
 *
 * @param marketConfigurator - On-chain market configurator address.
 * @param network - Optional network to restrict the search to.
 * @returns The curator name, or `undefined` if not found.
 **/
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
 * Finds the market configurator address for a given curator on a network.
 *
 * @param curator - Curator name to search for.
 * @param network - Network to search in.
 * @returns The market configurator address, or `undefined` if the curator
 *   has no configurator on this network.
 **/
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
