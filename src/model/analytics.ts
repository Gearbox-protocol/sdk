import type { Address } from "viem";
import type { ChartRange, ProtocolChartMetric } from "./charts.js";
import type { CuratorName } from "./curators.js";
import type { ChainScopedFilter, Filterable } from "./filters.js";
import type { LiquidationPosition } from "./liquidations.js";
import type {
  PoolPosition,
  Position,
  PositionCollateral,
  PositionFilter,
  StrategyPosition,
} from "./positions.js";
import type { ChainId } from "./primitives.js";

/**
 * A protocol-wide position row together with the wallet that owns it.
 *
 * The position fields stay flat, so consumers can render this row exactly as
 * they render a wallet-scoped {@link Position}; `borrower` is the only extra
 * identity the protocol-wide list needs.
 **/
export type AnalyticsPosition =
  | AnalyticsPoolPosition
  | AnalyticsStrategyPosition
  | AnalyticsLiquidationPosition;

/** Pool position with its owner on the protocol-wide list. */
export type AnalyticsPoolPosition = PoolPosition & AnalyticsPositionOwner;

/** Strategy position with its borrower on the protocol-wide list. */
export type AnalyticsStrategyPosition = StrategyPosition &
  AnalyticsPositionOwner;

/** Liquidation position with its owner on the protocol-wide list. */
export type AnalyticsLiquidationPosition = LiquidationPosition &
  AnalyticsPositionOwner;

/** Ownership added to every protocol-wide position row. */
export interface AnalyticsPositionOwner {
  /** Wallet that owns the pool shares or opened the credit account. */
  borrower: Address;
}

/** Fields the protocol-wide position list can order by. */
export type AnalyticsPositionSortField =
  | "netValueUsd"
  | "totalValueUsd"
  | "totalDebtUsd"
  | "pnlUsd"
  | "apy"
  | "healthFactor";

/** Direction of one analytics list ordering. */
export type AnalyticsSortDirection = "asc" | "desc";

/** A contract selected on exactly one chain by an analytics filter. */
export interface AnalyticsContractRef {
  /** Chain the contract lives on. */
  chainId: ChainId;
  /** Address of the pool, credit manager or token contract. */
  address: Address;
}

/**
 * Filtering, ordering and offset pagination of the protocol-wide position
 * list. Omitted position criteria have the same meaning as they do on
 * {@link PositionFilter}.
 *
 * Pool, credit manager, balance asset and curator filters accept one value or
 * a list. Values within a list combine with OR; different filters combine with
 * AND. An empty list matches no positions.
 *
 * Pool, credit manager and asset references match both chain and address,
 * within the chains this SDK covers and any further restriction from
 * `chainIds`. Curator names match across the selected chains.
 **/
export interface AnalyticsPositionListOptions extends PositionFilter {
  /** Keep only positions owned by this wallet. */
  borrower?: Address;
  /** Keep only positions associated with the given pool or pools. */
  pool?: AnalyticsContractRef | readonly AnalyticsContractRef[];
  /** Keep only positions associated with the given credit manager or managers. */
  creditManager?: AnalyticsContractRef | readonly AnalyticsContractRef[];
  /**
   * Keep only positions holding a positive balance of any selected token.
   * For credit accounts, match the token of each
   * {@link PositionCollateral.collateral}, including underlying balances.
   * Phantom tokens match their own address as reported in the balance.
   */
  asset?: AnalyticsContractRef | readonly AnalyticsContractRef[];
  /** Keep only positions in markets managed by the named curator or curators. */
  curator?: Filterable<CuratorName | readonly CuratorName[]>;
  /**
   * Field to order by. Values that do not apply to a position kind, and USD
   * values that cannot be priced, are always placed after concrete values.
   *
   * @defaultValue `"netValueUsd"`
   */
  sortBy?: AnalyticsPositionSortField;
  /** @defaultValue `"desc"` */
  sortDirection?: AnalyticsSortDirection;
  /** Number of matching rows to skip. @defaultValue `0` */
  offset?: number;
  /** Number of rows to return, from 1 through 100. @defaultValue `25` */
  limit?: number;
}

/** One page of the protocol-wide position list. */
export interface AnalyticsPositionPage {
  /** Requested slice after filtering and ordering. */
  items: AnalyticsPosition[];
  /** Number of rows matching the filter before pagination. */
  total: number;
  /** Effective number of rows skipped. */
  offset: number;
  /** Effective maximum number of rows returned. */
  limit: number;
}

/**
 * What one protocol-wide chart read asks for.
 *
 * A {@link ChartQuery} that also carries its chain scope: the series is a sum
 * over chains rather than a property of one subject, so which chains are in it
 * is part of the question and not something a path segment already answered.
 * Omitting `chainIds` asks for every chain the backend serves.
 **/
export interface AnalyticsChartQuery extends ChainScopedFilter {
  /**
   * Metrics to chart, at least one and each named once. They become the keys of
   * {@link ChartBundle.series}.
   **/
  metrics: readonly ProtocolChartMetric[];
  /**
   * Window to cover, echoed back in {@link ChartWindow.range}.
   **/
  range: ChartRange;
}
