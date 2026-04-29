/**
 * Mock MultichainSDK — the "onchain" data source.
 * Wraps per-chain OnchainSDK instances, reads state from compressors,
 * and can create RawTx to interact with the protocol.
 */
import type { Address, Hex, NetworkType, RawTx } from "../core/index.js";
import type { MarketState, PoolState } from "./types.js";

// ---------------------------------------------------------------------------
// Per-chain SDK
// ---------------------------------------------------------------------------

export class OnchainSDK {
  readonly network: NetworkType;
  readonly chainId: number;
  #markets: MarketState[] = [];

  constructor(network: NetworkType, chainId: number) {
    this.network = network;
    this.chainId = chainId;
  }

  async attach(): Promise<void> {
    this.#markets = [makeDummyMarket(this.network)];
  }

  get markets(): readonly MarketState[] {
    return this.#markets;
  }

  findPool(address: Address): PoolState | undefined {
    return this.#markets.find(m => m.pool.address === address)?.pool;
  }

  createDepositTx(poolAddress: Address, amount: bigint): RawTx {
    return {
      to: poolAddress,
      callData: `0x${amount.toString(16)}` as Hex,
      value: "0",
      description: `deposit ${amount} into pool ${poolAddress}`,
    };
  }
}

// ---------------------------------------------------------------------------
// Multichain wrapper
// ---------------------------------------------------------------------------

export interface MultichainSDKConfig {
  chains: Partial<Record<NetworkType, { rpcUrl: string }>>;
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

export class MultichainSDK {
  readonly #chains: Map<NetworkType, OnchainSDK> = new Map();

  constructor(config: MultichainSDKConfig) {
    for (const network of Object.keys(config.chains) as NetworkType[]) {
      this.#chains.set(
        network,
        new OnchainSDK(network, CHAIN_IDS[network] ?? 1),
      );
    }
  }

  async attach(): Promise<void> {
    await Promise.all([...this.#chains.values()].map(s => s.attach()));
  }

  chain(network: NetworkType): OnchainSDK {
    const sdk = this.#chains.get(network);
    if (!sdk) throw new Error(`Chain ${network} not configured`);
    return sdk;
  }

  allMarkets(): Array<{ network: NetworkType; market: MarketState }> {
    const result: Array<{ network: NetworkType; market: MarketState }> = [];
    for (const [network, sdk] of this.#chains) {
      for (const market of sdk.markets) {
        result.push({ network, market });
      }
    }
    return result;
  }
}

// ---------------------------------------------------------------------------
// Dummy data
// ---------------------------------------------------------------------------

function makeDummyMarket(network: NetworkType): MarketState {
  const poolAddr =
    network === "Mainnet"
      ? "0x1111111111111111111111111111111111111111"
      : "0x2222222222222222222222222222222222222222";
  return {
    configurator: "0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC" as Address,
    pool: {
      address: poolAddr as Address,
      underlying: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address,
      availableLiquidity: 3_000_000n * 10n ** 6n,
      isPaused: false,
      kycRequired: network === "Mainnet",
    },
  };
}
