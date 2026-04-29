import type { Address } from "viem";
import { GearboxEntity, type Mode, type SDKContext } from "../core/index.js";
import type { Market } from "../market/Market.js";
import { MarketCollection } from "../market/MarketCollection.js";
import type {
  OpportunityCollection,
  PoolOpportunityCollection,
  StrategyOpportunityCollection,
} from "../opportunity/index.js";
import type { MarketConfiguratorRef, OffchainCuratorData } from "./types.js";

export class Curator extends GearboxEntity {
  readonly #offchain: OffchainCuratorData;

  constructor(ctx: SDKContext<Mode>, offchain: OffchainCuratorData) {
    super(ctx);
    this.#offchain = offchain;
  }

  // ============================================================================
  // Common (offchain-only)
  // ============================================================================

  public get id(): string {
    return this.#offchain.id;
  }

  public get name(): string {
    return this.#offchain.name;
  }

  public get badDebtEvents(): number {
    return this.#offchain.badDebtEvents;
  }

  public get badDebtUsd(): number {
    return this.#offchain.badDebtUsd;
  }

  public get parameterChanges30d(): number {
    return this.#offchain.parameterChanges30d;
  }

  public get tvlUsd(): number {
    return this.#offchain.tvlUsd;
  }

  public get marketConfigurators(): MarketConfiguratorRef[] {
    return this.#offchain.marketConfigurators;
  }

  // ============================================================================
  // Navigation -- markets via marketConfigurator + chainId (onchain SDK)
  // ============================================================================

  public get markets(): MarketCollection<Mode> {
    const refs = this.#mcSet();
    const items = this.ctx.markets.all().filter(item => {
      const market = item as unknown as Market;
      const key = mcKey(market.marketConfigurator, market.chainId);
      return refs.has(key);
    });
    return new MarketCollection<Mode>(this.ctx, items);
  }

  // ============================================================================
  // Navigation -- opportunities by curatorId
  // ============================================================================

  public get opportunities(): OpportunityCollection<Mode> {
    return this.ctx.opportunities.filter(o => o.curator === this);
  }

  public get poolOpportunities(): PoolOpportunityCollection<Mode> {
    return this.ctx.opportunities.pools().filter(o => o.curator === this);
  }

  public get strategyOpportunities(): StrategyOpportunityCollection<Mode> {
    return this.ctx.opportunities.strategies().filter(o => o.curator === this);
  }

  #mcSet(): Set<string> {
    const set = new Set<string>();
    for (const ref of this.#offchain.marketConfigurators) {
      set.add(mcKey(ref.address, ref.chainId));
    }
    return set;
  }
}

function mcKey(address: Address, chainId: number): string {
  return `${chainId}:${address.toLowerCase()}`;
}
