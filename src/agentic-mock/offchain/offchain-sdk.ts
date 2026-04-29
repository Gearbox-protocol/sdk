/**
 * Mock OffchainSDK — the "offchain" data source.
 * Loads data from external APIs: APYs, descriptions, historical TVL.
 * Does NOT know how to create on-chain transactions.
 */
import type { Address, NetworkType, TvlChartData } from "../core/index.js";
import type { OffchainMarketData, OffchainPoolData } from "./types.js";

interface ChainOffchainState {
  network: NetworkType;
  chainId: number;
  markets: OffchainMarketData[];
}

export interface OffchainSDKConfig {
  chains: Partial<Record<NetworkType, { apiUrl: string }>>;
}

const CHAIN_IDS: Record<string, number> = {
  Mainnet: 1,
  Arbitrum: 42161,
  Optimism: 10,
  Base: 8453,
  Sonic: 146,
  Monad: 10143,
  Berachain: 80094,
};

export class OffchainSDK {
  readonly #chains: Map<NetworkType, ChainOffchainState> = new Map();

  constructor(config: OffchainSDKConfig) {
    for (const network of Object.keys(config.chains) as NetworkType[]) {
      this.#chains.set(network, {
        network,
        chainId: CHAIN_IDS[network] ?? 1,
        markets: [],
      });
    }
  }

  async attach(): Promise<void> {
    for (const [network, state] of this.#chains) {
      state.markets = [makeDummyOffchainMarket(network, state.chainId)];
    }
  }

  allMarkets(): Array<{ network: NetworkType; market: OffchainMarketData }> {
    const result: Array<{
      network: NetworkType;
      market: OffchainMarketData;
    }> = [];
    for (const [network, state] of this.#chains) {
      for (const market of state.markets) {
        result.push({ network, market });
      }
    }
    return result;
  }

  findPool(
    network: NetworkType,
    address: Address,
  ): OffchainPoolData | undefined {
    const state = this.#chains.get(network);
    return state?.markets.find(m => m.pool.address === address)?.pool;
  }

  async loadHistoricalTvl(
    _network: NetworkType,
    _poolAddress: Address,
    _from: number,
    _to: number,
  ): Promise<TvlChartData> {
    return [
      { timestamp: _from, tvl: 5_000_000 },
      { timestamp: (_from + _to) / 2, tvl: 7_500_000 },
      { timestamp: _to, tvl: 8_200_000 },
    ];
  }
}

// ---------------------------------------------------------------------------
// Dummy data
// ---------------------------------------------------------------------------

function makeDummyOffchainMarket(
  network: NetworkType,
  chainId: number,
): OffchainMarketData {
  const poolAddr =
    network === "Mainnet"
      ? "0x1111111111111111111111111111111111111111"
      : "0x2222222222222222222222222222222222222222";
  return {
    configurator: "0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC" as Address,
    pool: {
      address: poolAddr as Address,
      chainId,
      underlying: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address,
      availableLiquidity: 3_000_000n * 10n ** 6n,
      apy: 5.2,
      description: "High-yield USDC lending pool curated by Chaos Labs",
    },
  };
}
