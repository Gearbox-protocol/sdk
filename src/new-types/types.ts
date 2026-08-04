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
  value: number;
  usd: number | null;
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
export interface Token {
  chainId: ChainId;
  address: Address;
  symbol: string;
  decimals: number;
  /** May be an absolute URL or an application-owned asset path. */
  iconUrl: string | null;
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
export type AssetClass = "stable" | "eth" | "btc" | "other";
export type Lifecycle = "active" | "paused" | "shutdown";

/** Drives the disabled row style and the "show all" toggle. */
export interface OpportunityStatus {
  lifecycle: Lifecycle;
  canDeposit: boolean;
  isDefaultVisible: boolean;
}

export interface Curator {
  address: Address;
  name: string;
  url: string | null;
}

/** Feeds the detail page title. */
export interface OpportunityMarket {
  configuratorAddress: Address | null;
  curator: Curator | null;
}

export interface PoolFeatures {
  isRwa: boolean;
  hasDelayedWithdrawal: boolean;
}

export interface StrategyFeatures extends PoolFeatures {
  /** Presence is the zero-slippage signal; there is no separate boolean. */
  zeroSlippageToken: Token | null;
  hasDeleverageBot: boolean;
}

/**
 * For strategies, `supplied`/`borrowed` describe the borrowing pool and the
 * selected credit manager's debt. The strategy hero TVL binds to `supplied`.
 */
export interface Liquidity {
  supplied: Amount;
  borrowed: Amount;
  available: Amount;
  utilization: Ratio;
}

export interface RewardTokenYield {
  token: Token;
  apr: Rate;
}

export interface PointsProgram {
  id: string;
  name: string;
  multiplier: number | null;
  isPending: boolean;
}

/** Everything the APY cell and its rewards tooltip render, already fee-adjusted. */
export interface OpportunityYield {
  totalApy: Rate;
  baseApy: Rate;
  rewardApr: Rate;
  rewards: RewardTokenYield[];
  points: PointsProgram[];
}

export interface ProjectedPoints {
  id: string;
  name: string;
  amount: number;
}

/**
 * Owner-scoped earnings estimate for the `/earn` earnings banner, the
 * eligible-only filter and best-strategy selection. Both adapters must prepare
 * it owner-aware; selecting over prepared estimates in React is allowed,
 * arithmetic is not.
 */
export interface StrategyWalletEstimate {
  eligible: boolean;
  inputValueUsd: number;
  annualEarningsUsd: number | null;
  projectedPoints: ProjectedPoints[];
}

// ---------------------------------------------------------------------------
// Opportunity rows
// ---------------------------------------------------------------------------

interface EarnOpportunityRowBase {
  chainId: ChainId;
  title: string;
  underlyingToken: Token;
  assetClass: AssetClass;
  status: OpportunityStatus;
  market: OpportunityMarket;
  liquidity: Liquidity;
  yield: OpportunityYield;
  collateralTokens: Token[];
}

export interface PoolOpportunityRow extends EarnOpportunityRowBase {
  kind: "pool";
  id: PoolId;
  poolAddress: Address;
  /** Final label appended to the title, e.g. "v3". */
  version: string;
  features: PoolFeatures;
}

export interface StrategyOpportunityRow extends EarnOpportunityRowBase {
  kind: "strategy";
  id: StrategyId;
  creditManagerAddress: Address;
  targetCollateral: Token;
  maxLeverage: number | null;
  features: StrategyFeatures;
  /** Null when `listOpportunities` was called without an owner. */
  walletEstimate: StrategyWalletEstimate | null;
}

export type EarnOpportunityRow = PoolOpportunityRow | StrategyOpportunityRow;

// ---------------------------------------------------------------------------
// Detail-only groups
// ---------------------------------------------------------------------------

export interface AverageApy {
  oneDay: Rate;
  sevenDays: Rate;
  thirtyDays: Rate;
}

/** Source-prepared averages; the application never averages history points. */
export interface PoolPerformance {
  averageApy: AverageApy;
  apySevenDaysAgo: Rate | null;
}

export interface RateCurvePoint {
  utilization: Ratio;
  supplyApy: Rate;
  borrowApy: Rate;
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
  isActive: boolean;
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

/** The three rows of the strategy APY breakdown table, already fee-adjusted. */
export interface StrategyApyBreakdown {
  collateralApy: Rate;
  baseBorrowApy: Rate;
  additionalBorrowApy: Rate;
}

/** The four final percentages of the liquidation params table. */
export interface LiquidationSummary {
  threshold: Ratio;
  premium: Rate;
  fee: Rate;
  penalty: Rate;
}

export type OraclePair =
  | "collateral/underlying"
  | "collateral/usd"
  | "underlying/usd";
export type OracleKind = "fundamental" | "market" | "hardcoded" | "derived";

export interface OracleDependency {
  label: string;
  address: Address;
}

export interface OracleRow {
  pair: OraclePair;
  price: number;
  kind: OracleKind;
  /** Final "depends on" summary text. */
  dependsOn: string;
  feedAddress: Address | null;
  /** Flat dependency summary; null means unavailable. */
  dependencies: OracleDependency[] | null;
}

export interface OracleSummary {
  address: Address | null;
  rows: OracleRow[];
}

// ---------------------------------------------------------------------------
// Opportunity details
// ---------------------------------------------------------------------------

export interface PoolOpportunityDetail extends PoolOpportunityRow {
  performance: PoolPerformance;
  rateCurve: RateCurve;
  quotaAssets: QuotaAsset[];
  pendingCuratorActions: PendingCuratorAction[];
}

export interface StrategyOpportunityDetail extends StrategyOpportunityRow {
  apyBreakdown: StrategyApyBreakdown;
  rateCurve: RateCurve;
  liquidation: LiquidationSummary;
  oracle: OracleSummary;
}

export type EarnOpportunityDetail =
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

// ---------------------------------------------------------------------------
// Source contract
// ---------------------------------------------------------------------------

/**
 * Read contract implemented by the backend adapter and the Gearbox SDK adapter.
 *
 * Every method resolves with `{ data, meta }` or throws. The facade tries the
 * backend first and, on a transport error or schema-validation failure, falls
 * back to the SDK for the whole root result — never field by field — so
 * `meta.source` stays honest. Error classification (retry vs contract drift) is
 * internal to the facade.
 *
 * `listOpportunities` returns the full list: the screen filters and sorts
 * client-side over final values, so there is no filtering, paging or sorting
 * in this contract.
 * Passing an `owner` is what populates
 * {@link StrategyOpportunityRow.walletEstimate}.
 */
export interface EarnDataSource {
  listOpportunities(owner?: Address): Promise<ReadResult<EarnOpportunityRow[]>>;
  getPool(id: PoolId): Promise<ReadResult<PoolOpportunityDetail>>;
  getStrategy(id: StrategyId): Promise<ReadResult<StrategyOpportunityDetail>>;
  getHistory(
    id: OpportunityId,
    range: HistoryRange,
    metrics: HistoryMetric[],
  ): Promise<ReadResult<HistorySeries[]>>;
}

// ---------------------------------------------------------------------------
// Prepared operations (write model)
// ---------------------------------------------------------------------------

export type PoolOperationKind =
  | "pool-deposit"
  | "pool-withdraw"
  | "pool-redeem";
export type StrategyOperationKind =
  | "strategy-open"
  | "strategy-adjust"
  | "strategy-close";
export type OperationKind = PoolOperationKind | StrategyOperationKind;

export interface PoolOperationIntent {
  kind: PoolOperationKind;
  opportunityId: PoolId;
  parametersHash: Hex | null;
}

export interface StrategyOperationIntent {
  kind: StrategyOperationKind;
  opportunityId: StrategyId;
  parametersHash: Hex | null;
}

export type OperationIntent = PoolOperationIntent | StrategyOperationIntent;

export interface ApprovalRequirement {
  token: Token;
  spender: Address;
  requiredRaw: NonNegativeIntegerString;
  currentAllowanceRaw: NonNegativeIntegerString;
}

export interface PreparedTransaction {
  kind: "approval" | "operation";
  to: Address;
  data: Hex;
  valueRaw: NonNegativeIntegerString;
  description: string;
}

export interface AssetDelta {
  token: Token;
  amount: SignedAmount;
}

export type SimulationStatus = "success" | "failed" | "unsupported";

export interface Simulation {
  status: SimulationStatus;
  error: string | null;
  assetDeltas: AssetDelta[] | null;
}

export type OperationWarningSeverity = "info" | "warning" | "blocking";

export interface OperationWarning {
  code: string;
  severity: OperationWarningSeverity;
  message: string;
}

export interface PreparedOperation {
  id: string;
  intent: OperationIntent;
  chainId: ChainId;
  account: Address;
  stateBlock: BlockNumber;
  preparedAt: Timestamp;
  expiresAt: Timestamp;
  approvals: ApprovalRequirement[];
  transactions: PreparedTransaction[];
  simulation: Simulation;
  warnings: OperationWarning[];
}

export interface PrepareContext {
  account: Address;
  chainId: ChainId;
  /** Public RPC access only. Wallet signing remains in the application. */
  publicClient: PublicClient;
}

export interface EarnOperations {
  prepare(
    intent: OperationIntent,
    context: PrepareContext,
  ): Promise<PreparedOperation>;
}
