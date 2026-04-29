import type {
  IfOffchain,
  Mode,
  NetworkType,
  SDKContext,
} from "./core/index.js";
import { Curator } from "./curator/entity.js";
import { CuratorsNamespace } from "./curator/index.js";
import { Market } from "./market/entity.js";
import type { MarketsNamespaceType } from "./market/index.js";
import { MarketsNamespace } from "./market/index.js";
import { MockOffchainSDK } from "./offchain/index.js";
import { MockMultichainSDK } from "./onchain/index.js";
import type { Opportunity } from "./opportunity/entity.js";
import { PoolOpportunity, StrategyOpportunity } from "./opportunity/entity.js";
import { OpportunitiesNamespace } from "./opportunity/index.js";

// ============================================================================
// Public SDK types
// ============================================================================

export interface GearboxSDKBase {
  readonly modes: readonly Mode[];
  readonly networks: readonly NetworkType[];
}

export type GearboxNamespaces<M extends Mode> = {
  readonly markets: MarketsNamespaceType<M>;
} & IfOffchain<
  M,
  {
    readonly opportunities: OpportunitiesNamespace<M>;
    readonly curators: CuratorsNamespace;
  }
>;

export type GearboxSDK<M extends Mode> = GearboxSDKBase & GearboxNamespaces<M>;

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
// Implementation (non-generic)
// ============================================================================

class GearboxSDKImpl {
  readonly modes: readonly Mode[];
  readonly networks: readonly NetworkType[];

  #multichain: MockMultichainSDK | null = null;
  #offchain: MockOffchainSDK | null = null;

  markets!: MarketsNamespace<Mode>;
  opportunities!: OpportunitiesNamespace<Mode>;
  curators!: CuratorsNamespace;

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
      this.#multichain = new MockMultichainSDK({ chains });
    }

    if (config.modes.includes("offchain")) {
      const chains: Record<string, { apiUrl: string }> = {};
      for (const n of config.networks) {
        chains[n] = config.offchain?.chains?.[n] ?? {
          apiUrl: `https://api.${n.toLowerCase()}.example`,
        };
      }
      this.#offchain = new MockOffchainSDK({ chains });
    }
  }

  async attach(): Promise<void> {
    await Promise.all([this.#multichain?.attach(), this.#offchain?.attach()]);

    const ctx: SDKContext = {
      multichain: this.#multichain,
      offchain: this.#offchain,
    };

    const marketEntities = this.#buildMarkets(ctx);
    this.markets = new MarketsNamespace<Mode>(ctx, marketEntities);

    const opportunityEntities = this.#buildOpportunities(ctx);
    this.opportunities = new OpportunitiesNamespace<Mode>(
      ctx,
      opportunityEntities,
    );

    const curatorEntities = this.#buildCurators(ctx);
    this.curators = new CuratorsNamespace(ctx, curatorEntities);
  }

  #buildMarkets(ctx: SDKContext): Market[] {
    const offMarkets = this.#offchain?.markets ?? [];
    return offMarkets.map(offM => {
      const network = offM.network as NetworkType;
      const onchain = this.#multichain
        ?.chain(network)
        .findMarket(offM.pool.address);
      return new Market(ctx, offM, onchain);
    });
  }

  #buildOpportunities(ctx: SDKContext): Opportunity[] {
    const offOpps = this.#offchain?.opportunities ?? [];
    return offOpps.map(o => {
      const offMarket = this.#offchain?.markets.find(
        m => m.pool.address === o.poolAddress,
      );
      const network = offMarket?.network as NetworkType | undefined;
      const onchain = network
        ? this.#multichain?.chain(network).findMarket(o.poolAddress)
        : undefined;

      if (o.type === "strategy") {
        return new StrategyOpportunity(ctx, o, onchain);
      }
      return new PoolOpportunity(ctx, o, onchain);
    });
  }

  #buildCurators(ctx: SDKContext): Curator[] {
    const offCurators = this.#offchain?.curators ?? [];
    return offCurators.map(c => new Curator(ctx, c));
  }
}

// ============================================================================
// Factory
// ============================================================================

export function createGearboxSDK<const M extends Mode>(
  config: GearboxSDKConfig<M>,
): GearboxSDK<M> & { attach(): Promise<void> } {
  const impl = new GearboxSDKImpl(config as GearboxSDKConfig<Mode>);
  return impl as unknown as GearboxSDK<M> & { attach(): Promise<void> };
}
