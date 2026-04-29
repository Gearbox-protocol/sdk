/**
 * Market entity: public type, strategies, and implementation.
 */
import type { Address, Caps, Mode, NetworkType, RawTx } from "../core/index.js";
import type {
  Pool,
  PoolImpl,
  PoolOffchainStrategy,
  PoolOnchainStrategy,
} from "./pool.js";

// ============================================================================
// Public type
// ============================================================================

export interface MarketBase {
  readonly configurator: Address;
  readonly network: NetworkType;
  readonly chainId: number;
  readonly underlying: Address;
}

export type Market<M extends Mode> = MarketBase & {
  readonly pool: Pool<M>;
} & Caps<M, "Market">;

// ============================================================================
// Strategy interfaces
// ============================================================================

export interface MarketOnchainStrategy {
  createDepositTx(
    network: NetworkType,
    poolAddress: Address,
    amount: bigint,
  ): RawTx;
}

export interface MarketOffchainStrategy {
  getPoolApy(network: NetworkType, poolAddress: Address): number;
}

// ============================================================================
// Strategy implementations
// ============================================================================

export class MarketOnchainStrategyImpl implements MarketOnchainStrategy {
  #poolStrategy: PoolOnchainStrategy;
  constructor(poolStrategy: PoolOnchainStrategy) {
    this.#poolStrategy = poolStrategy;
  }

  createDepositTx(
    network: NetworkType,
    poolAddress: Address,
    amount: bigint,
  ): RawTx {
    return this.#poolStrategy.createDepositTx(network, poolAddress, amount);
  }
}

export class MarketOffchainStrategyImpl implements MarketOffchainStrategy {
  #poolStrategy: PoolOffchainStrategy;
  constructor(poolStrategy: PoolOffchainStrategy) {
    this.#poolStrategy = poolStrategy;
  }

  getPoolApy(network: NetworkType, poolAddress: Address): number {
    return this.#poolStrategy.getApy(network, poolAddress);
  }
}

// ============================================================================
// Implementation
// ============================================================================

export class MarketImpl implements MarketBase {
  readonly configurator: Address;
  readonly network: NetworkType;
  readonly chainId: number;
  readonly underlying: Address;
  readonly pool: PoolImpl;

  #onchain: MarketOnchainStrategy | null;
  #offchain: MarketOffchainStrategy | null;

  constructor(
    base: Omit<MarketBase, "underlying">,
    pool: PoolImpl,
    onchain: MarketOnchainStrategy | null,
    offchain: MarketOffchainStrategy | null,
  ) {
    this.configurator = base.configurator;
    this.network = base.network;
    this.chainId = base.chainId;
    this.underlying = pool.underlying;
    this.pool = pool;
    this.#onchain = onchain;
    this.#offchain = offchain;
  }

  createDepositTx(amount: bigint): RawTx {
    return this.#onchain!.createDepositTx(
      this.network,
      this.pool.address,
      amount,
    );
  }

  get poolApy(): number {
    return this.#offchain!.getPoolApy(this.network, this.pool.address);
  }
}
