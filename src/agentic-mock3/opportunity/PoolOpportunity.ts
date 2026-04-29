import { isAddressEqual } from "viem";
import { GearboxEntity, type Mode, type SDKContext } from "../core/index.js";
import type { Curator } from "../curator/Curator.js";
import type { MarketType } from "../market/Market.js";
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

  public get curator(): Curator {
    const id = this.#offchain.curatorId;
    const found = this.ctx.curators.all().find(c => c.id === id);
    if (!found) {
      throw new Error(`No curator found for id ${id}`);
    }
    return found;
  }

  public get access(): OpportunityAccess {
    return this.#offchain.access;
  }

  public get risk(): OpportunityRisk {
    return this.#offchain.risk;
  }

  // -- Pool-specific passthroughs --------------------------------------------

  public get market(): MarketType<Mode> {
    const poolAddress = this.#offchain.poolAddress;
    const chainId = this.#offchain.chainId;
    const found = this.ctx.markets
      .all()
      .find(
        m =>
          m.chainId === chainId && isAddressEqual(m.poolAddress, poolAddress),
      );
    if (!found) {
      throw new Error(
        `No market found for pool ${poolAddress} on chain ${chainId}`,
      );
    }
    return found;
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
