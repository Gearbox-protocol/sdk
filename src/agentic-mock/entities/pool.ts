/**
 * Pool entity: public type, strategies, and implementation.
 */
import type {
  Address,
  Caps,
  Mode,
  NetworkType,
  RawTx,
  TvlChartData,
} from "../core/index.js";
import type { OffchainSDK } from "../offchain/index.js";
import type { MultichainSDK } from "../onchain/index.js";

// ============================================================================
// Public type
// ============================================================================

export interface PoolBase {
  readonly address: Address;
  readonly network: NetworkType;
  readonly chainId: number;
  readonly underlying: Address;
  readonly availableLiquidity: bigint;
}

export type Pool<M extends Mode> = PoolBase & Caps<M, "Pool">;

// ============================================================================
// Strategy interfaces
// ============================================================================

export interface PoolOnchainStrategy {
  getKycRequired(network: NetworkType, poolAddress: Address): boolean;
  createDepositTx(
    network: NetworkType,
    poolAddress: Address,
    amount: bigint,
  ): RawTx;
}

export interface PoolOffchainStrategy {
  getApy(network: NetworkType, poolAddress: Address): number;
  getDescription(network: NetworkType, poolAddress: Address): string;
  loadHistoricalTvl(
    network: NetworkType,
    poolAddress: Address,
    from: number,
    to: number,
  ): Promise<TvlChartData>;
}

// ============================================================================
// Strategy implementations
// ============================================================================

export class PoolOnchainStrategyImpl implements PoolOnchainStrategy {
  #sdk: MultichainSDK;
  constructor(sdk: MultichainSDK) {
    this.#sdk = sdk;
  }

  getKycRequired(network: NetworkType, poolAddress: Address): boolean {
    return this.#sdk.chain(network).findPool(poolAddress)?.kycRequired ?? false;
  }

  createDepositTx(
    network: NetworkType,
    poolAddress: Address,
    amount: bigint,
  ): RawTx {
    return this.#sdk.chain(network).createDepositTx(poolAddress, amount);
  }
}

export class PoolOffchainStrategyImpl implements PoolOffchainStrategy {
  #sdk: OffchainSDK;
  constructor(sdk: OffchainSDK) {
    this.#sdk = sdk;
  }

  getApy(network: NetworkType, poolAddress: Address): number {
    return this.#sdk.findPool(network, poolAddress)?.apy ?? 0;
  }

  getDescription(network: NetworkType, poolAddress: Address): string {
    return this.#sdk.findPool(network, poolAddress)?.description ?? "";
  }

  loadHistoricalTvl(
    network: NetworkType,
    poolAddress: Address,
    from: number,
    to: number,
  ): Promise<TvlChartData> {
    return this.#sdk.loadHistoricalTvl(network, poolAddress, from, to);
  }
}

// ============================================================================
// Implementation
// ============================================================================

export class PoolImpl implements PoolBase {
  readonly address: Address;
  readonly network: NetworkType;
  readonly chainId: number;
  readonly underlying: Address;
  readonly availableLiquidity: bigint;

  #onchain: PoolOnchainStrategy | null;
  #offchain: PoolOffchainStrategy | null;

  constructor(
    base: PoolBase,
    onchain: PoolOnchainStrategy | null,
    offchain: PoolOffchainStrategy | null,
  ) {
    this.address = base.address;
    this.network = base.network;
    this.chainId = base.chainId;
    this.underlying = base.underlying;
    this.availableLiquidity = base.availableLiquidity;
    this.#onchain = onchain;
    this.#offchain = offchain;
  }

  get kycRequired(): boolean {
    return this.#onchain!.getKycRequired(this.network, this.address);
  }

  createDepositTx(amount: bigint): RawTx {
    return this.#onchain!.createDepositTx(this.network, this.address, amount);
  }

  get apy(): number {
    return this.#offchain!.getApy(this.network, this.address);
  }

  get description(): string {
    return this.#offchain!.getDescription(this.network, this.address);
  }

  loadHistoricalTvl(from: number, to: number): Promise<TvlChartData> {
    return this.#offchain!.loadHistoricalTvl(
      this.network,
      this.address,
      from,
      to,
    );
  }
}
