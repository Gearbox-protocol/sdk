import type { Address } from "viem";
import type { Mode } from "../core/index.js";
import type * as offchain from "../offchain/index.js";
import type { TokenType } from "../tokens/index.js";

export type OpportunityAccess = offchain.OpportunityAccess;
export type OpportunityRisk = offchain.OpportunityRisk;
export type YieldBreakdown = offchain.YieldBreakdown;

export interface PoolCollateral<M extends Mode> {
  token: TokenType<M>;
  quotaLimit: number;
  quotaUsed: number;
  quotaRate: number;
}

export interface StrategyCollateral<M extends Mode> extends PoolCollateral<M> {
  liquidationThreshold: number;
  yield: YieldBreakdown;
}

export interface OpportunityBase<M extends Mode> {
  id: string;
  chainId: number;
  type: "pool" | "strategy";
  title: string;
  curatorId: string; // TODO: curator entity
  underlyingToken: TokenType<M>;
  access: OpportunityAccess;
  risk: OpportunityRisk;
}

export interface PoolOpportunityType<M extends Mode>
  extends OpportunityBase<M> {
  type: "pool";
  poolAddress: Address; // TODO: pool/market entity

  yield: YieldBreakdown;

  supplied: number;
  borrowed: number;
  availableLiquidity: string;
  utilization: number;

  tvl: number;
  tvlUsd: number;

  collaterals: PoolCollateral<M>[];
}

export interface StrategyOpportunityType<M extends Mode>
  extends OpportunityBase<M> {
  type: "strategy";
  creditManagerAddress: Address;
  poolAddress: Address;

  targetCollateral: TokenType<M>;
  collaterals: StrategyCollateral<M>[];

  borrowed: number;
  totalValue: number;
  minDebt: number;
  maxDebt: number;
  borrowableLiquidity: number;

  maxLeverage: number;
  borrowApy: number;

  /** Headline: best yield achievable at max leverage on target collateral */
  maxLeveragedTargetCollateralYield: YieldBreakdown;
  /** Best collateral base yield without leverage */
  baseTargetCollateralYield: YieldBreakdown;

  hasDelayedWithdrawal: boolean;
}

export type Opportunity<M extends Mode> =
  | PoolOpportunityType<M>
  | StrategyOpportunityType<M>;
