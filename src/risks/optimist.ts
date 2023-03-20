import { MultiCall } from "../pathfinder/core";
import { RiskEvent } from "./risks";

export enum Underlying {
  DAI = "DAI",
  USDC = "USDC",
  WETH = "WETH",
  WBTC = "WBTC",
  wstETH = "wstETH",
  FRAX = "FRAX",
}

export enum LiquidatorType {
  GO = "GO",
  TS = "TS",
}

/**
 * Output produced after optimistic liquidation of one credit account
 */
export interface OptimisticResult {
  /**
   * Credit Manager address
   */
  creditManager: string;

  /**
   * Borrower address
   */
  borrower: string;

  /**
   * Gas used for liquidation from tx recepit
   */
  gasUsed: number;

  /**
   * Multicalls used as parameter in liquidateCreditAccount function
   */
  calls: Array<MultiCall>;

  /**
   * Estimated amount which was computed in pathfinder
   */
  pathAmount: string;

  /**
   * How much tokens liquidator got on its account for the liquidation
   * liquidatorPremium = underlyingBalanceAfterLiquidation - underlyingBalanceBeforeLiquidation
   */
  liquidatorPremium: string;
  /**
   * Difference between liquidator ETH balance before and after liquidation and swapping of underlying back to ETH
   */
  liquidatorProfit: string;

  /**
   * True if errors accrued
   */
  isError: boolean;

  /**
   * How much time it took to liquidate this account (ms)
   */
  duration?: number;
}

/**
 * Output produced by running one liquidator on one credit manager
 */
export interface OptimisticTrackResult {
  liquidatorType: LiquidatorType;
  underlying: Underlying;
  start: Date;
  end: Date;
  /**
   * Error that happened in optimistic runner, before liquidator could produce ant results
   */
  error?: string;
  result?: OptimisticResult[] | null;
}

/**
 * Output of optimistic runner execution
 */
export interface ExecutionResult {
  /**
   * Unique execution id
   */
  id: string;
  start: Date;
  end: Date;
  /**
   * Top-level error in optimistic runner execution (e.g. terminated early)
   */
  error?: string;
  /**
   * Results, one per underlying token/liquidator pair
   */
  results?: OptimisticTrackResult[];
}

export interface OptimisticRiskEventParams {
  /**
   * ExecutionResult serialized to string
   */
  json: string;
}

export type OptimistRiskEvent = RiskEvent<
  "OPTIMISTIC-LIQUIDATOR",
  "INF-OPTIMISTIC-FAIL" | "INF-OPTIMISTIC-SUCCESS",
  OptimisticRiskEventParams
>;
