import { GearboxEntity, type SDKContext } from "../core/index.js";
import { Curator } from "../curator/entity.js";
import { Market } from "../market/entity.js";
import type * as offchain from "../offchain/index.js";
import type { OpportunityAccess, OpportunityRisk } from "./types.js";

// ============================================================================
// PoolOpportunity
// ============================================================================

export class PoolOpportunity extends GearboxEntity {
  readonly #offchain: offchain.PoolOpportunity;
  // readonly #onchain: OnchainMarketData | undefined;

  constructor(
    ctx: SDKContext,
    offchain: offchain.PoolOpportunity,
    // onchain: OnchainMarketData | undefined,
  ) {
    super(ctx);
    this.#offchain = offchain;
    // this.#onchain = onchain;
  }

  public get id(): string {
    return this.#offchain.id;
  }

  public get chainId(): number {
    return this.#offchain.chainId;
  }

  public get title(): string {
    return this.#offchain.title;
  }

  public get curatorId(): string {
    return this.#offchain.curatorId;
  }

  public get underlyingToken(): Token {
    return this.#offchain.underlyingToken;
  }

  public get access(): OpportunityAccess {
    return this.#offchain.access;
  }

  public get risk(): OpportunityRisk {
    return this.#offchain.risk;
  }

  // -- Onchain ops -----------------------------------------------------------

  createDepositTx(amount: bigint): RawTx {
    const network = this.#resolveNetwork();
    return this.multichain
      .chain(network)
      .createDepositTx(this.poolAddress, amount);
  }

  // -- Navigation ------------------------------------------------------------

  get market(): Market {
    const network = this.#resolveNetwork();
    const offMarket = this.offchain.findMarket(network, this.poolAddress);
    return new Market(this.ctx, offMarket, this.#onchain);
  }

  get curator(): Curator | undefined {
    const offCurator = this.offchain.findCurator(this.curatorName);
    if (!offCurator) return undefined;
    return new Curator(this.ctx, offCurator);
  }

  #resolveNetwork(): NetworkType {
    return this.offchain.markets.find(m => m.pool.address === this.poolAddress)
      ?.network as NetworkType;
  }
}
