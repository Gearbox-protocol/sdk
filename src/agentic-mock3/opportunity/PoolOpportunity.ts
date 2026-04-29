import type { Address } from "viem";
import { GearboxEntity, type Mode, type SDKContext } from "../core/index.js";
import type * as offchain from "../offchain/index.js";
import type { TokenType } from "../tokens/index.js";
import type {
  OpportunityAccess,
  OpportunityRisk,
  PoolCollateral,
  PoolOpportunityType,
  YieldBreakdown,
} from "./types.js";

export class PoolOpportunity
  extends GearboxEntity
  implements PoolOpportunityType<Mode>
{
  readonly #offchain: offchain.PoolOpportunity;

  readonly type = "pool" as const;

  constructor(ctx: SDKContext<Mode>, offchain: offchain.PoolOpportunity) {
    super(ctx);
    this.#offchain = offchain;
  }

  // -- Common passthroughs ---------------------------------------------------

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

  public get access(): OpportunityAccess {
    return this.#offchain.access;
  }

  public get risk(): OpportunityRisk {
    return this.#offchain.risk;
  }

  // -- Pool-specific passthroughs --------------------------------------------

  public get poolAddress(): Address {
    return this.#offchain.poolAddress;
  }

  public get yield(): YieldBreakdown {
    return this.#offchain.yield;
  }

  public get supplied(): number {
    return this.#offchain.supplied;
  }

  public get borrowed(): number {
    return this.#offchain.borrowed;
  }

  public get availableLiquidity(): string {
    return this.#offchain.availableLiquidity;
  }

  public get utilization(): number {
    return this.#offchain.utilization;
  }

  public get tvl(): number {
    return this.#offchain.tvl;
  }

  public get tvlUsd(): number {
    return this.#offchain.tvlUsd;
  }

  // -- Navigation to tokens --------------------------------------------------

  public get underlyingToken(): TokenType<Mode> {
    const { address, chainId } = this.#offchain.underlyingToken;
    return this.ctx.tokens.getOrCreate(address, chainId);
  }

  public get collaterals(): PoolCollateral<Mode>[] {
    return this.#offchain.collaterals.map(c => ({
      token: this.ctx.tokens.getOrCreate(c.token.address, c.token.chainId),
      quotaLimit: c.quotaLimit,
      quotaUsed: c.quotaUsed,
      quotaRate: c.quotaRate,
    }));
  }
}
