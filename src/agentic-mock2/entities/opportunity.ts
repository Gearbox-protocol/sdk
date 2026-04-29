/**
 * Opportunity entities — PoolOpportunity and StrategyOpportunity.
 */
import type { Address, NetworkType, RawTx, SDKContext } from "../core/index.js";
import type {
  OffchainPoolOpportunity,
  OffchainStrategyOpportunity,
} from "../offchain/index.js";
import type { OnchainMarketData } from "../onchain/index.js";
import { Curator } from "./curator.js";
import { Market } from "./market.js";

// ============================================================================
// Mode-specific operations
// ============================================================================

export interface OnchainOpportunityOps {
  createDepositTx(amount: bigint): RawTx;
}

export interface OffchainOpportunityOps {
  readonly supplyApy: number;
}

// ============================================================================
// Public types
// ============================================================================

export interface OpportunityBase {
  readonly id: string;
  readonly chainId: number;
  readonly type: "pool" | "strategy";
  readonly title: string;
  readonly curatorName: string;
  readonly poolAddress: Address;
  readonly underlying: Address;
  readonly permissionless: boolean;
  readonly kycRequired: boolean;
}

export type Opportunity = PoolOpportunity | StrategyOpportunity;

// ============================================================================
// PoolOpportunity
// ============================================================================

export class PoolOpportunity implements OpportunityBase {
  readonly #ctx: SDKContext;
  readonly #offchain: OffchainPoolOpportunity;
  readonly #onchain: OnchainMarketData | undefined;

  readonly type = "pool" as const;

  constructor(
    ctx: SDKContext,
    offchain: OffchainPoolOpportunity,
    onchain: OnchainMarketData | undefined,
  ) {
    this.#ctx = ctx;
    this.#offchain = offchain;
    this.#onchain = onchain;
  }

  get id(): string {
    return this.#offchain.id;
  }
  get chainId(): number {
    return this.#offchain.chainId;
  }
  get title(): string {
    return this.#offchain.title;
  }
  get curatorName(): string {
    return this.#offchain.curatorName;
  }
  get poolAddress(): Address {
    return this.#offchain.poolAddress;
  }
  get underlying(): Address {
    return this.#offchain.underlying;
  }
  get permissionless(): boolean {
    return this.#offchain.permissionless;
  }
  get kycRequired(): boolean {
    return this.#offchain.kycRequired;
  }

  // -- Pool-specific ---------------------------------------------------------

  get supplyApy(): number {
    return this.#offchain.supplyApy;
  }
  get tvl(): number {
    return this.#offchain.tvl;
  }
  get tvlUsd(): number {
    return this.#offchain.tvlUsd;
  }
  get utilization(): number {
    return this.#offchain.utilization;
  }

  get availableLiquidity(): bigint {
    return this.#onchain?.pool.availableLiquidity ?? 0n;
  }

  // -- Onchain ops -----------------------------------------------------------

  createDepositTx(amount: bigint): RawTx {
    const network = this.#resolveNetwork();
    return this.#ctx
      .multichain!.chain(network)
      .createDepositTx(this.poolAddress, amount);
  }

  // -- Navigation ------------------------------------------------------------

  get market(): Market {
    const network = this.#resolveNetwork();
    const offMarket = this.#ctx.offchain?.findMarket(network, this.poolAddress);
    return new Market(this.#ctx, offMarket, this.#onchain);
  }

  get curator(): Curator | undefined {
    const offCurator = this.#ctx.offchain?.findCurator(this.curatorName);
    if (!offCurator) return undefined;
    return new Curator(this.#ctx, offCurator);
  }

  #resolveNetwork(): NetworkType {
    return this.#ctx.offchain!.markets.find(
      m => m.pool.address === this.poolAddress,
    )?.network as NetworkType;
  }
}

// ============================================================================
// StrategyOpportunity
// ============================================================================

export class StrategyOpportunity implements OpportunityBase {
  readonly #ctx: SDKContext;
  readonly #offchain: OffchainStrategyOpportunity;
  readonly #onchain: OnchainMarketData | undefined;

  readonly type = "strategy" as const;

  constructor(
    ctx: SDKContext,
    offchain: OffchainStrategyOpportunity,
    onchain: OnchainMarketData | undefined,
  ) {
    this.#ctx = ctx;
    this.#offchain = offchain;
    this.#onchain = onchain;
  }

  get id(): string {
    return this.#offchain.id;
  }
  get chainId(): number {
    return this.#offchain.chainId;
  }
  get title(): string {
    return this.#offchain.title;
  }
  get curatorName(): string {
    return this.#offchain.curatorName;
  }
  get poolAddress(): Address {
    return this.#offchain.poolAddress;
  }
  get underlying(): Address {
    return this.#offchain.underlying;
  }
  get permissionless(): boolean {
    return this.#offchain.permissionless;
  }
  get kycRequired(): boolean {
    return this.#offchain.kycRequired;
  }

  // -- Strategy-specific -----------------------------------------------------

  get creditManagerAddress(): Address {
    return this.#offchain.creditManagerAddress;
  }
  get borrowApy(): number {
    return this.#offchain.borrowApy;
  }
  get maxLeverage(): number {
    return this.#offchain.maxLeverage;
  }
  get basicApy(): number {
    return this.#offchain.basicApy;
  }
  get maxLeverageApy(): number {
    return this.#offchain.maxLeverageApy;
  }
  get minDebt(): bigint {
    return this.#offchain.minDebt;
  }
  get maxDebt(): bigint {
    return this.#offchain.maxDebt;
  }

  // -- Onchain ops -----------------------------------------------------------

  createDepositTx(amount: bigint): RawTx {
    const network = this.#resolveNetwork();
    return this.#ctx
      .multichain!.chain(network)
      .createDepositTx(this.poolAddress, amount);
  }

  // -- Navigation ------------------------------------------------------------

  get market(): Market {
    const network = this.#resolveNetwork();
    const offMarket = this.#ctx.offchain?.findMarket(network, this.poolAddress);
    return new Market(this.#ctx, offMarket, this.#onchain);
  }

  get curator(): Curator | undefined {
    const offCurator = this.#ctx.offchain?.findCurator(this.curatorName);
    if (!offCurator) return undefined;
    return new Curator(this.#ctx, offCurator);
  }

  #resolveNetwork(): NetworkType {
    return this.#ctx.offchain!.markets.find(
      m => m.pool.address === this.poolAddress,
    )?.network as NetworkType;
  }
}
