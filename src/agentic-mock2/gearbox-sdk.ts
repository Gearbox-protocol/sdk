/**
 * GearboxSDK — top-level type, implementation, and factory.
 *
 * The only `as unknown as` cast in the entire mock lives in createGearboxSDK.
 * All implementation classes are non-generic; the Mode parameter only restricts
 * the public type surface.
 */
import type {
  IfOffchain,
  Mode,
  NetworkType,
  SDKContext,
} from "./core/index.js";
import type {
  CuratorsNamespace,
  MarketsNamespace,
  OpportunitiesNamespace,
} from "./namespaces/index.js";
import {
  CuratorsNamespaceImpl,
  MarketsNamespaceImpl,
  OpportunitiesNamespaceImpl,
} from "./namespaces/index.js";
import { MockOffchainSDK } from "./offchain/index.js";
import { MockMultichainSDK } from "./onchain/index.js";

// ============================================================================
// Public SDK type
// ============================================================================

/**
 * Top-level SDK interface parameterised by active modes.
 * - `markets` is always present (offchain provides enriched data, onchain adds tx ops)
 * - `opportunities` appears when offchain mode is active (most data is offchain; onchain adds tx ops)
 * - `curators` appears when offchain mode is active
 */
export type GearboxSDK<M extends Mode> = {
  readonly markets: MarketsNamespace<M>;
  readonly modes: readonly M[];
  readonly networks: readonly NetworkType[];
} & IfOffchain<
  M,
  {
    readonly opportunities: OpportunitiesNamespace;
    readonly curators: CuratorsNamespace;
  }
>;

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
// Internal implementation (non-generic)
// ============================================================================

class GearboxSDKImpl {
  readonly modes: readonly Mode[];
  readonly networks: readonly NetworkType[];

  #multichain: MockMultichainSDK | null = null;
  #offchain: MockOffchainSDK | null = null;

  markets!: MarketsNamespaceImpl;
  opportunities!: OpportunitiesNamespaceImpl;
  curators!: CuratorsNamespaceImpl;

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

    this.markets = new MarketsNamespaceImpl(ctx);
    this.opportunities = new OpportunitiesNamespaceImpl(ctx);
    this.curators = new CuratorsNamespaceImpl(ctx);
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
