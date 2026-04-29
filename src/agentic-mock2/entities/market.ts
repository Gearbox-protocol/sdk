/**
 * Market entity — combines onchain MarketData with offchain enriched data.
 * All methods always exist; the Mode type system restricts which are visible.
 */
import type {
  Address,
  Caps,
  Mode,
  NetworkType,
  RawTx,
  SDKContext,
  TvlChartData,
} from "../core/index.js";
import type { OffchainMarketData } from "../offchain/index.js";
import type { OnchainMarketData } from "../onchain/index.js";
import { Curator } from "./curator.js";
import type { Opportunity } from "./opportunity.js";
import { PoolOpportunity, StrategyOpportunity } from "./opportunity.js";

// ============================================================================
// Mode-specific operations
// ============================================================================

export interface OnchainMarketOps {
  readonly kycRequired: boolean;
  readonly availableLiquidity: bigint;
  createDepositTx(amount: bigint): RawTx;
}

export interface OffchainMarketOps {
  readonly supplyApy: number;
  readonly description: string;
  loadHistoricalTvl(from: number, to: number): Promise<TvlChartData>;
}

// ============================================================================
// Public types
// ============================================================================

export interface MarketBase {
  readonly network: NetworkType;
  readonly chainId: number;
  readonly configurator: Address;
  readonly poolAddress: Address;
  readonly underlying: Address;
  readonly opportunities: Opportunity[];
  readonly curator: Curator | undefined;
}

export type MarketType<M extends Mode> = MarketBase & Caps<M, "Market">;

// ============================================================================
// Implementation
// ============================================================================

export class Market implements MarketBase {
  readonly #ctx: SDKContext;
  readonly #offchain: OffchainMarketData | undefined;
  readonly #onchain: OnchainMarketData | undefined;

  readonly network: NetworkType;
  readonly chainId: number;
  readonly configurator: Address;
  readonly poolAddress: Address;
  readonly underlying: Address;

  constructor(
    ctx: SDKContext,
    offchain: OffchainMarketData | undefined,
    onchain: OnchainMarketData | undefined,
  ) {
    this.#ctx = ctx;
    this.#offchain = offchain;
    this.#onchain = onchain;

    this.network = (offchain?.network ?? "") as NetworkType;
    this.chainId = offchain?.pool.chainId ?? 0;
    this.configurator =
      offchain?.configurator ?? onchain?.configurator ?? ("0x" as Address);
    this.poolAddress =
      offchain?.pool.address ?? onchain?.pool.address ?? ("0x" as Address);
    this.underlying =
      offchain?.pool.underlying ??
      onchain?.pool.underlying ??
      ("0x" as Address);
  }

  // -- Onchain ops -----------------------------------------------------------

  get kycRequired(): boolean {
    return this.#onchain?.pool.kycRequired ?? false;
  }

  get availableLiquidity(): bigint {
    return (
      this.#onchain?.pool.availableLiquidity ??
      this.#offchain?.pool.availableLiquidity ??
      0n
    );
  }

  createDepositTx(amount: bigint): RawTx {
    return this.#ctx
      .multichain!.chain(this.network)
      .createDepositTx(this.poolAddress, amount);
  }

  // -- Offchain ops ----------------------------------------------------------

  get supplyApy(): number {
    return this.#offchain?.pool.supplyApy ?? 0;
  }

  get description(): string {
    return this.#offchain?.pool.description ?? "";
  }

  async loadHistoricalTvl(from: number, to: number): Promise<TvlChartData> {
    return this.#ctx.offchain!.loadHistoricalTvl(
      this.network,
      this.poolAddress,
      from,
      to,
    );
  }

  // -- Navigation ------------------------------------------------------------

  get opportunities(): Opportunity[] {
    const offOpps =
      this.#ctx.offchain?.findOpportunitiesByPool(this.poolAddress) ?? [];
    return offOpps.map(o => {
      const onchain = this.#ctx.multichain
        ?.chain(this.network)
        .findMarket(this.poolAddress);
      if (o.type === "strategy") {
        return new StrategyOpportunity(this.#ctx, o, onchain);
      }
      return new PoolOpportunity(this.#ctx, o, onchain);
    });
  }

  get curator(): Curator | undefined {
    const curatorName = this.#offchain?.curatorName;
    if (!curatorName) return undefined;
    const offCurator = this.#ctx.offchain?.findCurator(curatorName);
    if (!offCurator) return undefined;
    return new Curator(this.#ctx, offCurator);
  }
}
