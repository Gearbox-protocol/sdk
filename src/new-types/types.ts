import type { Address, Hex, PublicClient } from "viem";

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
  value: bigint;
  valueUsd: number | null;
}

/** Exact signed token delta. Write models only. */
export interface SignedAmount {
  /** Exact signed token delta in base units. */
  raw: SignedIntegerString;
  decimals: number;
  value: number;
  usd: number | null;
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
// Identity
// ---------------------------------------------------------------------------

/**
 * Route/key encoding of a pool opportunity: `${chainId}:${poolAddress}`.
 * Matches `/earn/lender/:chainId/:address`.
 */
export type PoolId = `${number}:${Address}`;
/**
 * Route/key encoding of a strategy opportunity. Strategy identity is
 * creditManager + targetCollateral; this string is only its encoding.
 */
export type StrategyId = `${number}:${Address}:${Address}`;
export type OpportunityId = PoolId | StrategyId;

// ---------------------------------------------------------------------------
// Data quality
// ---------------------------------------------------------------------------

export type DataSource = "backend" | "sdk";

/**
 * The only fallback signal any scoped screen consumes: it drives the
 * "live data unavailable, showing on-chain fallback" hint. Per-field absence is
 * carried by `null` at the canonical field, so no freshness, block or
 * partial-ness metadata ships here. Block pinning belongs to
 * {@link PreparedOperation.stateBlock}.
 */
export interface DataMeta {
  source: DataSource;
}

export interface ReadResult<T> {
  data: T;
  meta: DataMeta;
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

interface OpportunityBase {
  chainId: ChainId;
  title: string;
  curator: Curator;
  underlyingToken: Token;
  totalSupply: Amount;
  totalBorrow: Amount;
  utilizationPct: number;
  supplyApy: ApyBreakdown;
  collateralTokens: Token[];
  // rwa: boolean;
  // delayedWithdrawals: boolean;
  // status: OpportunityStatus;
}

export interface PoolOpportunityBase extends OpportunityBase {
  kind: "pool";
  poolAddress: Address;
}

export interface StrategyOpportunityBase extends OpportunityBase {
  kind: "strategy";
  creditManagerAddress: Address;
  targetCollateral: Token;
  liquidationThresholdPct: number;
  liquidationPenaltyPct: number;
  collateralApy: ApyBreakdown;
  borrowApyPct: number;
  additionalBorrowApyPct: number;
  maxBorrowAmount: Amount;
  maxLeverage: number;
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
  used: Amount | null;
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

export type OraclePair =
  | "collateral/underlying"
  | "collateral/usd"
  | "underlying/usd";

export interface OracleDependency {
  label: string;
  address: Address;
}

export interface OracleData {
  pair: OraclePair;
  price: number;
  feedAddress: Address | null;
  /** Flat dependency summary; null means unavailable. */
  dependencies: OracleDependency[] | null;
}

export interface OracleDataSummary {
  address: Address | null;
  data: OracleData[];
}

// ---------------------------------------------------------------------------
// Opportunity details
// ---------------------------------------------------------------------------

export interface PoolOpportunityDetail extends PoolOpportunityBase {
  apy1d: number;
  apy7d: number;
  apy30d: number;
  rateCurve: RateCurve;
  quotaAssets: QuotaAsset[];
  // pendingCuratorActions: PendingCuratorAction[];
}

export interface StrategyOpportunityDetail extends StrategyOpportunityBase {
  rateCurve: RateCurve;
  oracle: OracleDataSummary;
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
// export interface EarnDataSource {
//   listOpportunities(owner?: Address): Promise<ReadResult<EarnOpportunityRow[]>>;
//   getPool(id: PoolId): Promise<ReadResult<PoolOpportunityDetail>>;
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
