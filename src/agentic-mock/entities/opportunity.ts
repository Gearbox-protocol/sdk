/**
 * Opportunity entity — synthetic, requires BOTH onchain and offchain modes.
 */
import type { Address, NetworkType, RawTx } from "../core/index.js";
import type { PoolImpl, PoolOnchainStrategy } from "./pool.js";

// ============================================================================
// Public types
// ============================================================================

export interface OpportunityBase {
  readonly id: string;
  readonly network: NetworkType;
  readonly type: "pool" | "strategy";
  readonly underlying: Address;
}

export interface PoolOpportunityData extends OpportunityBase {
  readonly type: "pool";
  readonly poolAddress: Address;
  readonly apy: number;
  readonly availableLiquidity: bigint;
  readonly kycRequired: boolean;
  readonly description: string;
  createDepositTx(amount: bigint): RawTx;
}

export type Opportunity = PoolOpportunityData; // | StrategyOpportunityData

// ============================================================================
// Implementation
// ============================================================================

export class PoolOpportunityImpl implements PoolOpportunityData {
  readonly type = "pool" as const;
  readonly id: string;
  readonly network: NetworkType;
  readonly underlying: Address;
  readonly poolAddress: Address;
  readonly apy: number;
  readonly availableLiquidity: bigint;
  readonly kycRequired: boolean;
  readonly description: string;

  #onchainStrategy: PoolOnchainStrategy;

  constructor(pool: PoolImpl, onchainStrategy: PoolOnchainStrategy) {
    this.id = `pool-opp-${pool.network}-${pool.address}`;
    this.network = pool.network;
    this.underlying = pool.underlying;
    this.poolAddress = pool.address;
    this.apy = pool.apy;
    this.availableLiquidity = pool.availableLiquidity;
    this.kycRequired = pool.kycRequired;
    this.description = pool.description;
    this.#onchainStrategy = onchainStrategy;
  }

  createDepositTx(amount: bigint): RawTx {
    return this.#onchainStrategy.createDepositTx(
      this.network,
      this.poolAddress,
      amount,
    );
  }
}
