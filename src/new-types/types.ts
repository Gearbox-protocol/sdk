import type { Address, Hex, PublicClient } from "viem";
import { SdkAlreadyAttachedError } from "../sdk/index.js";

export type { Address, Hex } from "viem";

/**
 * Earn read/write contract types.
 *
 * This module is type-only on purpose: runtime schemas live next to it in
 * `common.ts`, `opportunities.ts`, `history.ts`, `quality.ts` and `source.ts`,
 * and each of them pins its schemas to the types declared here with
 * `satisfies z.ZodType<T>`. Never import zod from this file.
 *
 * Read models are final and UI-ready. The backend is the primary source and the
 * Gearbox SDK is the fallback; both must prepare display values so React never
 * performs financial or protocol math. Values needed only as inputs to such math
 * (interest-rate-model parameters, unformatted oracle answers, fee inputs,
 * liquidation-discount inputs) are deliberately absent.
 */

// ---------------------------------------------------------------------------
// Numeric primitives
// ---------------------------------------------------------------------------

export type ChainId = number;
/** Unix timestamp in seconds. */
export type Timestamp = number;
/** Decimal fraction: 0.05 means 5%. Negative rates stay representable. */
export type Rate = number;
/** Decimal fraction constrained to 0..1. */
export type Ratio = number;

/** Exact base-unit integer. Write models only. */
export type NonNegativeIntegerString = string;
/** Exact signed base-unit integer. Write models only. */
export type SignedIntegerString = string;
export type BlockNumber = bigint;

/**
 * Final display amount. The owning group names the token, so no symbol or
 * decimals are repeated here. Exactness lives in the write model.
 */
export interface Amount {
  value: bigint; // in underlying token units
  valueUsd: number | null;
}

/** The single token type, shared by read models and prepared operations. */
// @sdk satisfy TokenData
export interface Token {
  chainId: ChainId;
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
}

// ---------------------------------------------------------------------------
// Opportunity groups
// ---------------------------------------------------------------------------

export type OpportunityKind = "pool" | "strategy";
export type OpportunityStatus = "active" | "paused" | "?";
export type OpportunityClass = "stable" | "eth" | "btc" | "other";

export interface Curator {
  address: Address;
  name: string;
  url: string | null;
}

// ---------------------------------------------------------------------------
// Opportunity rows
// ---------------------------------------------------------------------------

// {
//   ("id");
//   : "0x...",
//   "loanAsset": "address": "0x...", "symbol": "USDC" ,
//   "collateralAsset": "address": "0x...", "symbol": "WETH" ,
//   "lltvPct": "86",
//   "borrowApyPct": "3.12",
//   "supplyApyPct": "2.10",
//   "utilizationPct": "75",
//   "totalSupply":    "symbol": "USDC", "value": "5000000" ,
//   "totalBorrow":    "symbol": "USDC", "value": "3500000" ,
//   "totalCollateral": "symbol": "WETH", "value": "1500" ,
//   "totalLiquidity": "symbol": "USDC", "value": "1500000" ,
//   "supplyAssetsUsd": "5000000.00",
//   "borrowAssetsUsd": "3500000.00",
//   "collateralAssetsUsd": "4200000.00",
//   "liquidityAssetsUsd": "1500000.00",
//   "rewards": [
// {
//   ("asset");
//   : "address": "0x...", "symbol": "MORPHO" ,
//     "supplyAprPct": "1.20"
// }
// ]

// }

interface TokenRewards {
  kind: "token";
  token: Token;
  supplyAprPct?: number;
  borrowAprPct?: number;
}

export interface PointsProgram {
  id: string;
  name: string;
  multiplier: number | null;
}

interface PointRewards {
  kind: "point";
  points: PointsProgram[];
}

type Rewards = TokenRewards | PointRewards;

interface ApyBreakdown {
  totalApyPct: number;
  organicApyPct: number;
  rewards: Rewards[];
}

// Strategy defined as
// (chainId, creditManager, tragetToken = lt != 0 && quotaLimit != 0)

interface OpportunityBase {
  chainId: ChainId;
  title: string;
  curator: Curator;
  underlyingToken: Token;
  totalSupply: Amount;
  totalBorrow: Amount;
  utilizationPct: number;
  supplyApy?: ApyBreakdown; // if kind=strategy -> apy on maxLeverage
  collateralTokens: Token[];
  // rwa: boolean;
  // opprtunityClass: OpportunityClass
  // delayedWithdrawals: boolean;
  // status: OpportunityStatus;
}

// id = (chainId, poolAddress)
export interface PoolOpportunityBase extends OpportunityBase {
  kind: "pool";
  poolAddress: Address;
}

// id = (chainId, creditManagerAddress, targetCollateralAddress)
export interface StrategyOpportunityBase extends OpportunityBase {
  kind: "strategy";
  creditManagerAddress: Address;
  targetCollateral: Token;
  liquidationThresholdPct: number; // lt of
  liquidationPremiumPct: number;
  liquidationFeePct: number;
  collateralApy?: ApyBreakdown;
  borrowApyPct: number;
  additionalBorrowApyPct: number; // quotaRate * (maxLeverage - 1) (?)
  maxBorrowAmount: Amount; // min(debtLimit, availableLiquidity)
  maxLeverage: number; // 1 / (1 - lt)
}

export type Opportunity = PoolOpportunityBase | StrategyOpportunityBase;

// ---------------------------------------------------------------------------
// Detail-only groups
// ---------------------------------------------------------------------------

export interface RateCurvePoint {
  utilization: Ratio;
  supplyApyPct: Rate;
  borrowApyPct: Rate;
}

/**
 * Final chart points; the application never evaluates the interest rate model.
 * Current utilization lives only at {@link Liquidity.utilization}.
 */
export interface RateCurve {
  points: RateCurvePoint[];
  /** Chart marker; null means borrowing has no utilization cutoff. */
  borrowingLimitUtilization: Ratio | null;
}

export interface QuotaAsset {
  token: Token;
  quotaRate: Rate;
  limit: Amount;
  used: Amount;
}

export interface CuratorActionChange {
  label: string;
  token: Token | null;
  /** Final display strings, never machine-usable protocol inputs. */
  before: string | null;
  after: string | null;
}

export interface PendingCuratorAction {
  /** Stable slug of the action, e.g. "set-quota-rate". */
  kind: string;
  executeAt: Timestamp;
  changes: CuratorActionChange[];
}

export interface PriceFeedData {
  name: string;
  type: string; // contractType or External
  feedAddress: Address;
  dependencies: PriceFeedData[];
}

export type PriceFeedSummary = {
  underlyingPriceInUsd: number;
  collateralPriceInUsd: number;
  collateralPriceInUnderlying: number;
  underlyingFeed: PriceFeedData;
  collateralFeed: PriceFeedData; // main feed only
};

// ---------------------------------------------------------------------------
// Opportunity details
// ---------------------------------------------------------------------------

export interface PoolOpportunityDetail extends PoolOpportunityBase {
  rateCurve: RateCurve;
  quotaAssets: QuotaAsset[];
  // pendingCuratorActions: PendingCuratorAction[];
}

export interface StrategyOpportunityDetail extends StrategyOpportunityBase {
  rateCurve: RateCurve;
  priceFeeds: PriceFeedSummary;
}

export type OpportunityDetail =
  | PoolOpportunityDetail
  | StrategyOpportunityDetail;

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

export type HistoryRange = "1d" | "1w" | "1m" | "1y" | "max";

export type PoolHistoryMetric =
  | "depositApy"
  | "borrowApy"
  | "dieselRate"
  | "supplied"
  | "borrowed"
  | "availableLiquidity";

/**
 * `collateralPrice` is the collateral/underlying series the liquidation chart
 * draws, so the oracles block reuses it and only adds the two USD pairs.
 */
export type StrategyHistoryMetric =
  | "netApy"
  | "borrowApy"
  | "collateralApy"
  | "tvl"
  | "collateralPrice"
  | "collateralUsdPrice"
  | "underlyingUsdPrice";

export type HistoryMetric = PoolHistoryMetric | StrategyHistoryMetric;

export interface HistoryPoint {
  timestamp: Timestamp;
  value: number;
}

/** The metric name defines the unit; no separate unit field ships. */
export interface HistorySeries {
  metric: HistoryMetric;
  points: HistoryPoint[];
}

// // ---------------------------------------------------------------------------
// // Source contract
// // ---------------------------------------------------------------------------

// /**
//  * Read contract implemented by the backend adapter and the Gearbox SDK adapter.
//  *
//  * Every method resolves with `{ data, meta }` or throws. The facade tries the
//  * backend first and, on a transport error or schema-validation failure, falls
//  * back to the SDK for the whole root result — never field by field — so
//  * `meta.source` stays honest. Error classification (retry vs contract drift) is
//  * internal to the facade.
//  *
//  * `listOpportunities` returns the full list: the screen filters and sorts
//  * client-side over final values, so there is no filtering, paging or sorting
//  * in this contract.
//  * Passing an `owner` is what populates
//  * {@link StrategyOpportunityRow.walletEstimate}.
//  */

type OpprtunityQueryFilter = {
  kind?: OpportunityKind;
  chainId?: ChainId[];
  underlyingToken?: Token[];
  // opprtunityClass?: OpportunityClass;
};

// export interface EarnDataSource {
//   listOpportunities();
//   getPool(chain): Promise<ReadResult<PoolOpportunityDetail>>;
//   getStrategy(id: StrategyId): Promise<ReadResult<StrategyOpportunityDetail>>;
//   getHistory(
//     id: OpportunityId,
//     range: HistoryRange,
//     metrics: HistoryMetric[],
//   ): Promise<ReadResult<HistorySeries[]>>;
// }

// // ---------------------------------------------------------------------------
// // Prepared operations (write model)
// // ---------------------------------------------------------------------------

// export type PoolOperationKind =
//   | "pool-deposit"
//   | "pool-withdraw"
//   | "pool-redeem";
// export type StrategyOperationKind =
//   | "strategy-open"
//   | "strategy-adjust"
//   | "strategy-close";
// export type OperationKind = PoolOperationKind | StrategyOperationKind;

// export interface PoolOperationIntent {
//   kind: PoolOperationKind;
//   opportunityId: PoolId;
//   parametersHash: Hex | null;
// }

// export interface StrategyOperationIntent {
//   kind: StrategyOperationKind;
//   opportunityId: StrategyId;
//   parametersHash: Hex | null;
// }

// export type OperationIntent = PoolOperationIntent | StrategyOperationIntent;

// export interface ApprovalRequirement {
//   token: Token;
//   spender: Address;
//   requiredRaw: NonNegativeIntegerString;
//   currentAllowanceRaw: NonNegativeIntegerString;
// }

// export interface PreparedTransaction {
//   kind: "approval" | "operation";
//   to: Address;
//   data: Hex;
//   valueRaw: NonNegativeIntegerString;
//   description: string;
// }

// export interface AssetDelta {
//   token: Token;
//   amount: SignedAmount;
// }

// export type SimulationStatus = "success" | "failed" | "unsupported";

// export interface Simulation {
//   status: SimulationStatus;
//   error: string | null;
//   assetDeltas: AssetDelta[] | null;
// }

// export type OperationWarningSeverity = "info" | "warning" | "blocking";

// export interface OperationWarning {
//   code: string;
//   severity: OperationWarningSeverity;
//   message: string;
// }

// export interface PreparedOperation {
//   id: string;
//   intent: OperationIntent;
//   chainId: ChainId;
//   account: Address;
//   stateBlock: BlockNumber;
//   preparedAt: Timestamp;
//   expiresAt: Timestamp;
//   approvals: ApprovalRequirement[];
//   transactions: PreparedTransaction[];
//   simulation: Simulation;
//   warnings: OperationWarning[];
// }

// export interface PrepareContext {
//   account: Address;
//   chainId: ChainId;
//   /** Public RPC access only. Wallet signing remains in the application. */
//   publicClient: PublicClient;
// }

// export interface EarnOperations {
//   prepare(
//     intent: OperationIntent,
//     context: PrepareContext,
//   ): Promise<PreparedOperation>;
// }

// ═══════════════════════════════════════════════════════════════
// Positions
// ═══════════════════════════════════════════════════════════════

interface TokenRewardsPnL {
  kind: "token";
  token: Token;
  value: Amount;
}

interface PointsProgramPnL extends PointsProgram {
  value: number;
}

interface PointRewardsPnL {
  kind: "point";
  points: PointsProgramPnL[];
}

type RewardsPnL = TokenRewardsPnL | PointRewardsPnL;

export interface PnlBreakdown {
  /** PnL in the underlying asset (organic interest + price moves). */
  organic: Amount;
  total: Amount;
  rewards: RewardsPnL;
}

export interface PositionCollateral {
  collateral: Token;
  balance: Amount;
  quota: number;
  /** Epoch seconds */
  // expectedWithdrawalTimestamp?: number;
  // withdrawals?: [];
}

// export type UserPositionBase = {};

export interface PoolPosition {
  chainId: number;
  poolAddress: Address;

  netValue: Amount;

  /** Current rates the position is earning. */
  apy: ApyBreakdown;

  /** Accumulated earnings. */
  pnl: PnlBreakdown;
}

export interface StrategyPosition {
  /**
   * Human label `"<underlying> / <target collateral>"` (e.g. `"WETH / wstETH"`);
   * the target is the dominant non-underlying collateral at the session's
   * opening block. Just the underlying symbol when the opening snapshot holds
   * no other collateral.
   */
  name: string;
  chainId: number;
  creditManagerAddress: Address;
  creditAccountAddress: Address;
  /**
   * The account's dominant non-underlying collateral at the session's opening
   * block (greatest opening-block USD value) — the asset the position was
   * initially leveraged into. `null` when the opening snapshot holds only the
   * underlying.
   */
  targetCollateralAddress: Address | null;

  /**
   * Debt/equity ratio: `debt / equity` (`equity = totalValue − debt`). `0` =
   * unleveraged; `0` if underwater. Same notation as the opportunity
   * `maxLeverage`, and bounded by it.
   */
  leverage: number;

  /** Current borrow rate. Decimal fraction. */
  borrowApy: number;
  /** Current net APY for the whole position. Decimal fraction. */
  netApy?: ApyBreakdown;

  debt: Amount;
  /** Total account value (all collateral) in the pool's underlying asset. */
  totalValue: Amount;
  /** Decimal fraction; < 1.0 means the position is liquidatable. */
  healthFactor: number;

  /** Accumulated earnings. */
  pnl?: PnlBreakdown;

  collaterals: PositionCollateral[];
}
