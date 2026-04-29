import type { Address } from "viem";
import { GearboxEntity, type Mode, type SDKContext } from "../core/index.js";
import type * as offchain from "../offchain/index.js";
import type { TokenType } from "../tokens/index.js";
import type {
  OpportunityAccess,
  OpportunityRisk,
  StrategyCollateral,
  StrategyOpportunityType,
  YieldBreakdown,
} from "./types.js";

export class StrategyOpportunity
  extends GearboxEntity
  implements StrategyOpportunityType<Mode>
{
  readonly #offchain: offchain.StrategyOpportunity;

  readonly type = "strategy" as const;

  constructor(ctx: SDKContext<Mode>, offchain: offchain.StrategyOpportunity) {
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

  // -- Strategy-specific passthroughs ----------------------------------------

  public get creditManagerAddress(): Address {
    return this.#offchain.creditManagerAddress;
  }

  public get poolAddress(): Address {
    return this.#offchain.poolAddress;
  }

  public get borrowed(): number {
    return this.#offchain.borrowed;
  }

  public get totalValue(): number {
    return this.#offchain.totalValue;
  }

  public get minDebt(): number {
    return this.#offchain.minDebt;
  }

  public get maxDebt(): number {
    return this.#offchain.maxDebt;
  }

  public get borrowableLiquidity(): number {
    return this.#offchain.borrowableLiquidity;
  }

  public get maxLeverage(): number {
    return this.#offchain.maxLeverage;
  }

  public get borrowApy(): number {
    return this.#offchain.borrowApy;
  }

  public get maxLeveragedTargetCollateralYield(): YieldBreakdown {
    return this.#offchain.maxLeveragedTargetCollateralYield;
  }

  public get baseTargetCollateralYield(): YieldBreakdown {
    return this.#offchain.baseTargetCollateralYield;
  }

  public get hasDelayedWithdrawal(): boolean {
    return this.#offchain.hasDelayedWithdrawal;
  }

  // -- Navigation to tokens --------------------------------------------------

  public get underlyingToken(): TokenType<Mode> {
    const { address, chainId } = this.#offchain.underlyingToken;
    return this.ctx.tokens.getOrCreate(address, chainId);
  }

  public get targetCollateral(): TokenType<Mode> {
    const { address, chainId } = this.#offchain.targetCollateral;
    return this.ctx.tokens.getOrCreate(address, chainId);
  }

  public get collaterals(): StrategyCollateral<Mode>[] {
    return this.#offchain.collaterals.map(c => ({
      token: this.ctx.tokens.getOrCreate(c.token.address, c.token.chainId),
      quotaLimit: c.quotaLimit,
      quotaUsed: c.quotaUsed,
      quotaRate: c.quotaRate,
      liquidationThreshold: c.liquidationThreshold,
      yield: c.yield,
    }));
  }
}
