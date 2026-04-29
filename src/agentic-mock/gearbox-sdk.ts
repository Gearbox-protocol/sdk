/**
 * GearboxSDK — top-level type, implementation, and factory.
 */
import type { Address, IfBothModes, Mode, NetworkType } from "./core/index.js";
import type { RawMarketInput } from "./entities/index.js";
import {
  buildEntities,
  MarketOffchainStrategyImpl,
  MarketOnchainStrategyImpl,
  PoolOffchainStrategyImpl,
  PoolOnchainStrategyImpl,
} from "./entities/index.js";
import type {
  MarketsNamespace,
  OpportunitiesNamespace,
  PoolsNamespace,
} from "./namespaces/index.js";
import {
  MarketsNamespaceImpl,
  OpportunitiesNamespaceImpl,
  PoolsNamespaceImpl,
} from "./namespaces/index.js";
import { OffchainSDK } from "./offchain/index.js";
import { MultichainSDK } from "./onchain/index.js";

// ============================================================================
// Public SDK type
// ============================================================================

/**
 * Top-level SDK interface parameterised by active modes.
 * `opportunities` namespace only appears when both modes are active.
 */
export type GearboxSDK<M extends Mode> = {
  readonly markets: MarketsNamespace<M>;
  readonly pools: PoolsNamespace<M>;
  readonly modes: readonly M[];
  readonly networks: readonly NetworkType[];
} & IfBothModes<M, { readonly opportunities: OpportunitiesNamespace }>;

// ============================================================================
// Config
// ============================================================================

export interface GearboxSDKConfig<M extends Mode> {
  modes: M[];
  networks: NetworkType[];
  onchain?: { chains: Partial<Record<NetworkType, { rpcUrl: string }>> };
  offchain?: { chains: Partial<Record<NetworkType, { apiUrl: string }>> };
}

// ============================================================================
// Internal implementation
// ============================================================================

class GearboxSDKImpl {
  readonly modes: readonly Mode[];
  readonly networks: readonly NetworkType[];

  #multichainSDK: MultichainSDK | null = null;
  #offchainSDK: OffchainSDK | null = null;

  markets!: MarketsNamespaceImpl<any>;
  pools!: PoolsNamespaceImpl<any>;
  opportunities?: OpportunitiesNamespaceImpl;

  constructor(config: GearboxSDKConfig<Mode>) {
    this.modes = config.modes;
    this.networks = config.networks;

    if (config.modes.includes("onchain")) {
      const chains: Record<string, { rpcUrl: string }> = {};
      for (const n of config.networks) {
        chains[n] = config.onchain?.chains?.[n] ?? {
          rpcUrl: `https://rpc.${n.toLowerCase()}.example`,
        };
      }
      this.#multichainSDK = new MultichainSDK({ chains });
    }

    if (config.modes.includes("offchain")) {
      const chains: Record<string, { apiUrl: string }> = {};
      for (const n of config.networks) {
        chains[n] = config.offchain?.chains?.[n] ?? {
          apiUrl: `https://api.${n.toLowerCase()}.example`,
        };
      }
      this.#offchainSDK = new OffchainSDK({ chains });
    }
  }

  async attach(): Promise<void> {
    await Promise.all([
      this.#multichainSDK?.attach(),
      this.#offchainSDK?.attach(),
    ]);

    const poolOnchain = this.#multichainSDK
      ? new PoolOnchainStrategyImpl(this.#multichainSDK)
      : null;
    const poolOffchain = this.#offchainSDK
      ? new PoolOffchainStrategyImpl(this.#offchainSDK)
      : null;
    const marketOnchain = poolOnchain
      ? new MarketOnchainStrategyImpl(poolOnchain)
      : null;
    const marketOffchain = poolOffchain
      ? new MarketOffchainStrategyImpl(poolOffchain)
      : null;

    const rawInputs = this.#mergeMarketData();

    const { pools, markets, opportunities } = buildEntities(rawInputs, {
      poolOnchain,
      poolOffchain,
      marketOnchain,
      marketOffchain,
    });

    this.pools = new PoolsNamespaceImpl(pools);
    this.markets = new MarketsNamespaceImpl(markets);

    if (poolOnchain && poolOffchain) {
      this.opportunities = new OpportunitiesNamespaceImpl(opportunities);
    }
  }

  #mergeMarketData(): RawMarketInput[] {
    const byKey = new Map<string, RawMarketInput>();

    if (this.#multichainSDK) {
      for (const { network, market } of this.#multichainSDK.allMarkets()) {
        const chain = this.#multichainSDK.chain(network);
        const key = `${network}:${market.pool.address}`;
        byKey.set(key, {
          network,
          chainId: chain.chainId,
          configurator: market.configurator,
          poolAddress: market.pool.address,
          underlying: market.pool.underlying,
          availableLiquidity: market.pool.availableLiquidity,
        });
      }
    }

    if (this.#offchainSDK) {
      for (const { network, market } of this.#offchainSDK.allMarkets()) {
        const key = `${network}:${market.pool.address}`;
        if (!byKey.has(key)) {
          byKey.set(key, {
            network,
            chainId: market.pool.chainId,
            configurator: market.configurator,
            poolAddress: market.pool.address,
            underlying: market.pool.underlying,
            availableLiquidity: market.pool.availableLiquidity,
          });
        }
      }
    }

    return [...byKey.values()];
  }
}

// ============================================================================
// Factory
// ============================================================================

/**
 * Creates a GearboxSDK with the specified modes and networks.
 *
 * The `const` type parameter ensures TypeScript infers literal mode types,
 * so `createGearboxSDK({ modes: ['onchain'] })` produces
 * `GearboxSDK<'onchain'>` rather than `GearboxSDK<Mode>`.
 *
 * Call `.attach()` on the returned SDK to load initial data.
 */
export function createGearboxSDK<const M extends Mode>(
  config: GearboxSDKConfig<M>,
): GearboxSDK<M> & { attach(): Promise<void> } {
  const impl = new GearboxSDKImpl(config as GearboxSDKConfig<Mode>);
  return impl as unknown as GearboxSDK<M> & { attach(): Promise<void> };
}
