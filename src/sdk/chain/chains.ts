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
  megaethTestnet,
  monadTestnet,
  optimism,
  sonic,
  worldchain,
} from "viem/chains";
import { z } from "zod/v4";

export type Curator = "Chaos Labs" | "K3" | "cp0x" | "Re7" | "Invariant Group";

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
   * Alchemy subdomain to construct provider URL
   */
  alchemyDomain?: string;
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
      },
      isPublic: true,
      wellKnownToken: {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        symbol: "USDC",
      },
      alchemyDomain: "eth-mainnet",
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
      alchemyDomain: "arb-mainnet",
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
      },
      isPublic: true,
      wellKnownToken: {
        address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
        symbol: "USDC",
      },
      alchemyDomain: "opt-mainnet",
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
      alchemyDomain: "base-mainnet",
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
      alchemyDomain: "sonic-mainnet",
      firstBlock: 9779380n,
    }),
    "sonic-rpc",
  ),
  MegaETH: defineChain({
    ...megaethTestnet,
    network: "MegaETH",
    defaultMarketConfigurators: {
      "0x59Db4A2241BFe5Ba9023d47A012a6c7A039139A6": "Chaos Labs",
    },
    isPublic: false,
    // TODO: has no block explorer API
    wellKnownToken: {
      address: "0x4eB2Bd7beE16F38B1F4a0A5796Fffd028b6040e9",
      symbol: "WETH",
    },
  }),
  Monad: defineChain({
    ...monadTestnet,
    network: "Monad",
    defaultMarketConfigurators: {},
    isPublic: false,
    wellKnownToken: {
      address: "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea",
      symbol: "USDC",
    },
    // TODO: has no block explorer API
    alchemyDomain: "monad-testnet",
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
      alchemyDomain: "berachain-mainnet",
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
      alchemyDomain: "avax-mainnet",
    },
    "avalanche-c-chain-rpc",
  ),
  BNB: withPublicNode(
    {
      ...bsc,
      network: "BNB",
      defaultMarketConfigurators: {
        "0x19037a281025b83fa37e3264b77af523ff87a3a4": "Chaos Labs",
      },
      testMarketConfigurators: {
        "0x92DC4Ee43e9B207e16FbF3fD1a6933563C0A0D35": "Re7",
      },
      isPublic: true,
      wellKnownToken: {
        address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
        symbol: "USDC",
      },
      alchemyDomain: "bnb-mainnet",
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
    alchemyDomain: "worldchain-mainnet",
    // TODO: has no block explorer API
  }),
  Etherlink: defineChain({
    ...etherlink,
    network: "Etherlink",
    defaultMarketConfigurators: {},
    testMarketConfigurators: {
      "0x8850dbdac3d249409ce7ae56c74481f8425df32d": "Re7",
    },
    isPublic: false,
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
    throw new Error("Unsupported network");
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
