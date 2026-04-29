import { type Address, isAddressEqual } from "viem";
import { ADDRESS_0X0, type NetworkType } from "../../sdk/index.js";
import {
  type Caps,
  GearboxEntity,
  type Mode,
  ModeNotAvailableError,
  type SDKContext,
} from "../core/index.js";
import type { Curator } from "../curator/Curator.js";
import type {
  OpportunityCollection,
  PoolOpportunityCollection,
  StrategyOpportunityCollection,
} from "../opportunity/index.js";
import type { TokenType } from "../tokens/index.js";
import type {
  CommonMarketCaps,
  OffchainMarketData,
  OnchainMarketData,
} from "./types.js";

export type MarketType<M extends Mode> = CommonMarketCaps & Caps<M, "Market">;

export class Market extends GearboxEntity implements CommonMarketCaps {
  readonly #onchain: OnchainMarketData | undefined;
  readonly #offchain: OffchainMarketData | undefined;

  readonly #network: NetworkType;
  readonly #chainId: number;
  readonly #poolAddress: Address;
  readonly #underlyingAddress: Address;

  constructor(
    ctx: SDKContext<Mode>,
    network: NetworkType,
    chainId: number,
    onchain: OnchainMarketData | undefined,
    offchain: OffchainMarketData | undefined,
  ) {
    super(ctx);
    this.#onchain = onchain;
    this.#offchain = offchain;

    this.#network = network;
    this.#chainId = chainId;
    this.#poolAddress = onchain?.pool.pool.address ?? ADDRESS_0X0;
    this.#underlyingAddress = onchain?.underlying ?? ADDRESS_0X0;
  }

  // ============================================================================
  // Common
  // ============================================================================

  public get network(): NetworkType {
    return this.#network;
  }

  public get chainId(): number {
    return this.#chainId;
  }

  public get poolAddress(): Address {
    return this.#poolAddress;
  }

  public get underlying(): TokenType<Mode> {
    return this.ctx.tokens.getOrCreate(this.#underlyingAddress, this.#chainId);
  }

  // ============================================================================
  // Onchain
  // ============================================================================

  private get onchainData(): OnchainMarketData {
    if (!this.#onchain) {
      throw new ModeNotAvailableError("onchain", this.constructor.name);
    }
    return this.#onchain;
  }

  public get marketConfigurator(): Address {
    return this.onchainData.configurator.address;
  }

  public get lossPolicy(): string {
    return this.onchainData.lossPolicy.contractType;
  }

  public get totalSupply(): bigint {
    return this.onchainData.pool.pool.totalSupply;
  }

  public get availableLiquidity(): bigint {
    return this.onchainData.pool.pool.availableLiquidity;
  }

  public get expectedLiquidity(): bigint {
    return this.onchainData.pool.pool.expectedLiquidity;
  }

  public get baseInterestRate(): bigint {
    return this.onchainData.pool.pool.baseInterestRate;
  }

  public get supplyRate(): bigint {
    return this.onchainData.pool.pool.supplyRate;
  }

  public get withdrawFee(): bigint {
    return this.onchainData.pool.pool.withdrawFee;
  }

  public get totalBorrowed(): bigint {
    return this.onchainData.pool.pool.totalBorrowed;
  }

  public get totalDebtLimit(): bigint {
    return this.onchainData.pool.pool.totalDebtLimit;
  }

  /**
   * Union of collateral token addresses across every credit manager in this market.
   * Onchain-only.
   */
  public get collateralTokens(): Address[] {
    const seen = new Set<Address>();
    for (const cm of this.onchainData.creditManagers) {
      for (const addr of cm.creditManager.collateralTokens) {
        seen.add(addr);
      }
    }
    return [...seen];
  }

  public get curator(): Curator {
    const mc = this.marketConfigurator;
    const chainId = this.#chainId;
    const found = this.ctx.curators
      .all()
      .find(c =>
        c.marketConfigurators.some(
          ref => ref.chainId === chainId && isAddressEqual(ref.address, mc),
        ),
      );
    if (!found) {
      throw new Error(
        `No curator found for market configurator ${mc} on chain ${chainId}`,
      );
    }
    return found;
  }

  // ============================================================================
  // Offchain (placeholder data; navigation reads from ctx.opportunities)
  // ============================================================================

  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: reserved for future offchain market data
  private get offchainData(): OffchainMarketData {
    if (!this.#offchain) {
      throw new ModeNotAvailableError("offchain", this.constructor.name);
    }
    return this.#offchain;
  }

  // ============================================================================
  // Navigation -- opportunities by poolAddress
  // ============================================================================

  public get opportunities(): OpportunityCollection<Mode> {
    return this.ctx.opportunities.filter(o => o.market === this);
  }

  public get poolOpportunities(): PoolOpportunityCollection<Mode> {
    return this.ctx.opportunities.pools().filter(o => o.market === this);
  }

  public get strategyOpportunities(): StrategyOpportunityCollection<Mode> {
    return this.ctx.opportunities.strategies().filter(o => o.market === this);
  }
}
