import type { Address, Hex } from "viem";
import type { ChainScopedFilter, Filterable } from "./filters.js";
import { isFilterSet } from "./filters.js";
import type {
  DelayedReceivedAsset,
  LiquidationPosition,
} from "./liquidations.js";
import type { ApyBreakdown, PointsProgram } from "./opportunities.js";
import type {
  AssetType,
  Bps,
  ChainId,
  Leverage,
  Timestamp,
  Token,
  TokenAmount,
  UnderlyingToken,
} from "./primitives.js";

/**
 * Discriminator of the three kinds of position a wallet can hold.
 *
 * - `"pool"` — pool shares earning the supply rate.
 * - `"strategy"` — an open credit account.
 * - `"liquidation"` — a delayed withdrawal a liquidator took ownership of,
 *   see {@link LiquidationPosition}.
 **/
export type PositionKind = "pool" | "strategy" | "liquidation";

/**
 * Earnings paid out in a token, as an amount rather than a rate.
 **/
export interface TokenRewardsPnL extends TokenAmount {
  kind: "token";
}

/**
 * A points program together with how many points the position has accrued in
 * it. The program itself is described by {@link PointsProgram}.
 **/
export interface PointsProgramPnL extends PointsProgram {
  /**
   * Points accrued so far. Points have no price, so this is a plain count
   * rather than an {@link Amount}.
   *
   * @example `12500.5`
   **/
  value: number;
}

/**
 * Earnings accrued as points rather than tokens.
 **/
export interface PointsRewardsPnL {
  kind: "point";
  /**
   * Programs the position has accrued points in.
   **/
  points: PointsProgramPnL[];
}

/**
 * Any earnings stream of a position, as accrued amounts.
 **/
export type RewardsPnL = TokenRewardsPnL | PointsRewardsPnL;

/**
 * What a position has earned since it was opened, split the same way
 * {@link ApyBreakdown} splits the rates that produced it.
 *
 * Every field needs the position's history, so the whole group is off-chain
 * only, see {@link PoolPosition.pnl} and {@link StrategyPosition.pnl}.
 **/
export interface PnlBreakdown {
  /**
   * The part the protocol itself generated: organic interest plus price moves,
   * denominated in the underlying.
   **/
  organic: TokenAmount;
  /**
   * Everything combined, including the value of {@link rewards} that has a
   * price. Denominated in the underlying.
   **/
  total: TokenAmount;
  /**
   * Incentives earned on top of {@link organic}, plus any points programs that
   * carry no value at all.
   **/
  rewards: RewardsPnL[];
}

/**
 * One collateral token of a credit account: what the account holds of it, what
 * it pays quota on, and what it has on its way out.
 **/
export interface PositionCollateral {
  /**
   * Amount of the token the account holds. Phantom tokens are reported as-is,
   * i.e. as the phantom token rather than as the asset it redeems into.
   **/
  collateral: TokenAmount;
  /**
   * Quota bought for {@link collateral}, denominated in the market's
   * underlying rather than in the collateral token.
   **/
  quota: TokenAmount;
  /**
   * Delayed withdrawals of this collateral, denominated in the asset the
   * phantom token redeems into. Empty when nothing is on its way out.
   **/
  withdrawals: DelayedReceivedAsset[];
}

/**
 * Pool shares held by a wallet.
 **/
export interface PoolPosition {
  /**
   * Discriminates this position from the other kinds a wallet can hold.
   **/
  kind: "pool";
  /**
   * Human-readable name for the row, the pool's own name.
   *
   * @example `"USDC Pool"`
   **/
  name: string;
  /**
   * Chain the pool lives on.
   **/
  chainId: ChainId;
  /**
   * Address of the ERC-4626 pool contract.
   **/
  pool: Address;
  /**
   * Pool underlying token.
   *
   * For RWA markets this is the unwrapped asset, e.g. USDC rather than
   * dcUSDC (the pool's on-chain underlying).
   **/
  underlyingToken: UnderlyingToken;
  /**
   * Underlying the held shares are worth at the current share rate, i.e.
   * `pool.convertToAssets(pool.balanceOf(wallet))`.
   **/
  netValue: TokenAmount;
  /**
   * Rate the position is currently earning. Its
   * {@link ApyBreakdown.organicApy} is the pool's own supply rate, so this
   * group is present in `onchain` mode too, with only that part filled.
   **/
  apy: ApyBreakdown;
  /**
   * Average {@link apy} over the trailing seven days.
   *
   * Absent in `onchain` mode: calculating it requires historical data.
   *
   * @mode offchain
   **/
  apyAvg7D?: ApyBreakdown;
  /**
   * What the position has earned so far.
   *
   * @mode offchain
   **/
  pnl?: PnlBreakdown;
}

/**
 * Per-token quota rate contribution of one collateral token, relative to the
 * position's total value.
 **/
export interface TokenQuotaRate {
  token: Token;
  rate: Bps;
}

/**
 * Cost of a position's debt broken down by source.
 *
 * The base rate is what the pool charges on the debt; each quoted collateral
 * adds its own quota rate on top. Rates are reported in two normalizations:
 * relative to the position's total value and relative to its debt.
 **/
export interface BorrowRateBreakdown {
  /**
   * Base rate plus quota rates, relative to the position's total value.
   **/
  total: Bps;
  /**
   * Base rate plus quota rates, relative to the debt. This is the rate the
   * debt itself grows at, so it feeds `timeToLiquidation`.
   **/
  totalOnDebt: Bps;
  /**
   * Annual cost of the borrowed underlying itself: the pool's base rate plus
   * the credit manager's interest fee. Same value `borrowApy` reports.
   **/
  base: Bps;
  /**
   * Per-token quota rate contribution, relative to the position's total value.
   **/
  quotas: TokenQuotaRate[];
}

/**
 * Set on {@link StrategyPosition.error} when the account could not be fully
 * valued (e.g. a dead price feed).
 **/
export const STRATEGY_POSITION_COLLATERAL_ERROR =
  "collateral computation failed";

/**
 * An open credit account of a wallet.
 **/
export interface StrategyPosition {
  /**
   * Discriminates this position from the other kinds a wallet can hold.
   **/
  kind: "strategy";
  /**
   * Human-readable strategy name, e.g. `"wstETH / WETH"`. Derived from
   * {@link targetCollateral}.
   *
   * In both-mode merge the backend value overlays the chain row, so a
   * source disagreement is expected.
   **/
  name: string;
  /**
   * Chain the account lives on.
   **/
  chainId: ChainId;
  /**
   * Credit manager the account is opened in.
   **/
  creditManager: Address;
  /**
   * Credit account address.
   **/
  creditAccount: Address;
  /**
   * Pool underlying token.
   *
   * For RWA markets this is the unwrapped asset, e.g. USDC rather than
   * dcUSDC (the pool's on-chain underlying).
   **/
  underlyingToken: UnderlyingToken;
  /**
   * Collateral token this position is a strategy in.
   *
   * In both-mode merge the backend value overlays the chain row, so a
   * source disagreement is expected.
   **/
  targetCollateral: Token | null;
  /**
   * Total-value leverage: `totalValue / (totalValue − totalDebt)`. `1` =
   * unleveraged; `0` if underwater. Same notation as opportunity `maxLeverage`,
   * and bounded by it.
   **/
  leverage: Leverage;
  /**
   * Annual cost of the borrowed underlying, in basis points, including the
   * protocol's interest fee: the pool's base rate scaled by the credit
   * manager's `feeInterest`.
   *
   * @example `520` for 5.2% APY
   **/
  borrowApy: Bps;
  /**
   * Average {@link borrowApy} over the trailing seven days, in basis points.
   *
   * Absent in `onchain` mode: calculating it requires historical data.
   *
   * @mode offchain
   **/
  borrowApyAvg7D?: Bps;
  /**
   * Net rate the whole position is currently earning, i.e. the collateral's
   * yield at this {@link leverage} minus the cost of the debt carrying it.
   *
   * Absent in `onchain` mode: its collateral yield term is.
   *
   * @mode offchain
   **/
  netApy?: ApyBreakdown;
  /**
   * Average {@link netApy} over the trailing seven days.
   *
   * @mode offchain
   **/
  netApyAvg7D?: ApyBreakdown;
  /**
   * Debt principal plus accrued interest and fees.
   **/
  totalDebt: TokenAmount;
  /**
   * Total account value: every collateral it holds, denominated in the
   * market's underlying.
   **/
  totalValue: TokenAmount;
  /**
   * Health factor in basis points: below `10000` the account is liquidatable.
   *
   * @example `12500` for a health factor of 1.25
   **/
  healthFactor: Bps;
  /**
   * Cost of the debt broken down into the pool's base rate and per-token
   * quota rates.
   *
   * @mode onchain
   **/
  borrowRate?: BorrowRateBreakdown;
  /**
   * Average {@link borrowRate} over the trailing seven days.
   *
   * Absent in `onchain` mode: calculating it requires historical data.
   *
   * @mode offchain
   **/
  borrowRateAvg7D?: BorrowRateBreakdown;
  /**
   * Estimated milliseconds until the health factor decays to `10000` under
   * the current borrow rate, or `null` when it cannot be estimated.
   *
   * @mode onchain
   **/
  timeToLiquidation?: bigint | null;
  /**
   * Price of the single non-underlying collateral at which the account
   * becomes liquidatable, in the oracle's 8-decimal fixed point, or `null`
   * when the account holds zero or several non-underlying assets.
   *
   * @mode onchain
   **/
  liquidationPrice?: bigint | null;
  /**
   * What the position has earned so far.
   *
   * @mode offchain
   **/
  pnl?: PnlBreakdown;
  /**
   * Every collateral token the account holds, with its quota and pending
   * withdrawals.
   **/
  collaterals: PositionCollateral[];
  /**
   * Present when the account could not be fully valued (e.g. a dead price
   * feed). Identity, balances, and debt principal are still filled; valued
   * fields are best-effort. Set by either the chain compressor path or the
   * backend.
   **/
  error?: string;
}

/**
 * A row of the positions list: anything a wallet holds in the protocol.
 **/
export type Position = PoolPosition | StrategyPosition | LiquidationPosition;

/**
 * Canonical id of a position: the string used to match a row read from the
 * chain with the same row served by the backend.
 *
 * A position list is always scoped to one wallet, so the wallet is not part of
 * the id.
 **/
export type PositionId = string;

/**
 * Builds the canonical id of a pool position.
 *
 * @example
 * ```ts
 * poolPositionId(1, "0xda00...") // "1:pool:0xda00..."
 * ```
 **/
export function poolPositionId(chainId: ChainId, pool: Address): PositionId {
  return `${chainId}:pool:${pool.toLowerCase()}`;
}

/**
 * Builds the canonical id of a strategy position. The credit account address
 * identifies it on its own, the credit manager is not part of the id.
 *
 * @example
 * ```ts
 * strategyPositionId(1, "0x9c4c...") // "1:strategy:0x9c4c..."
 * ```
 **/
export function strategyPositionId(
  chainId: ChainId,
  creditAccount: Address,
): PositionId {
  return `${chainId}:strategy:${creditAccount.toLowerCase()}`;
}

/**
 * Builds the canonical id of a liquidation position.
 *
 * The redeemer is the withdrawal's own contract and therefore identifies it,
 * but compressor versions below 313 do not report one; those fall back to the
 * source token plus the moment the withdrawal becomes claimable, which is what
 * distinguishes two withdrawals of the same asset.
 **/
export function liquidationPositionId(
  chainId: ChainId,
  position: Pick<
    LiquidationPosition,
    "redeemer" | "sourceToken" | "claimableAt"
  >,
): PositionId {
  const { redeemer, sourceToken, claimableAt } = position;
  const key = redeemer
    ? redeemer.toLowerCase()
    : `${sourceToken.address.toLowerCase()}:${claimableAt ?? "claimable"}`;
  return `${chainId}:liquidation:${key}`;
}

/**
 * Canonical id of any position, dispatching on {@link Position.kind}.
 **/
export function positionId(position: Position): PositionId {
  switch (position.kind) {
    case "pool":
      return poolPositionId(position.chainId, position.pool);
    case "strategy":
      return strategyPositionId(position.chainId, position.creditAccount);
    case "liquidation":
      return liquidationPositionId(position.chainId, position);
  }
}

/**
 * Optional narrowing of a positions list.
 *
 * Every condition is optional and an omitted one matches any value, so an
 * empty filter is the same as no filter at all. A condition can also be set to
 * `"all"` to say the same thing explicitly, which is what a UI whose state has
 * an "any" option holds, see {@link Filterable}. Conditions combine with AND.
 **/
export interface PositionFilter extends ChainScopedFilter {
  /**
   * Keep only positions of this kind.
   **/
  kind?: Filterable<PositionKind>;
  /**
   * Keep only credit accounts that carry no debt, or only the ones that do.
   * Applicable only to {@link StrategyPosition}
   **/
  isZeroDebt?: Filterable<boolean>;
  /**
   * Keep only positions whose underlying is of this class, which for an RWA
   * market means the class of the token its wrapper holds.
   *
   * Not applicable to {@link LiquidationPosition}
   **/
  underlyingType?: Filterable<AssetType>;
}

/**
 * Whether a position satisfies every condition of a filter.
 *
 * This is the single definition of what each condition means: every source
 * builds its rows first and runs them through here, so the chain and the
 * backend cannot disagree on what a filter selects.
 *
 * A condition that does not apply to a position's kind keeps the row rather
 * than dropping it: `isZeroDebt` says nothing about a pool position, and
 * `underlyingType` says nothing about a liquidation position, which is
 * denominated in whatever its withdrawal pays out.
 *
 * @param position - Row to test.
 * @param filter - Conditions to test against. An absent filter matches
 * anything.
 **/
export function matchesPositionFilter(
  position: Position,
  filter?: PositionFilter,
): boolean {
  if (!filter) {
    return true;
  }
  if (isFilterSet(filter.kind) && position.kind !== filter.kind) {
    return false;
  }
  if (filter.chainIds && !filter.chainIds.includes(position.chainId)) {
    return false;
  }
  if (
    isFilterSet(filter.isZeroDebt) &&
    position.kind === "strategy" &&
    (position.totalDebt.value === 0n) !== filter.isZeroDebt
  ) {
    return false;
  }
  if (isFilterSet(filter.underlyingType)) {
    const underlying = positionUnderlying(position);
    if (underlying && underlying.assetType !== filter.underlyingType) {
      return false;
    }
  }
  return true;
}

/**
 * Token a position's headline amount is denominated in, or `undefined` for a
 * kind that has no single underlying.
 **/
function positionUnderlying(position: Position): Token | undefined {
  switch (position.kind) {
    case "pool":
    case "strategy":
      return position.underlyingToken;
    case "liquidation":
      return undefined;
  }
}

/**
 * Identifies a pool position in a detail or history request.
 **/
export interface PoolPositionKey {
  chainId: ChainId;
  /**
   * Address of the ERC-4626 pool contract.
   **/
  pool: Address;
  /**
   * Wallet holding the shares. Unlike an opportunity, a position exists only
   * relative to its holder.
   **/
  wallet: Address;
}

/**
 * Identifies a strategy position in a detail or history request. The credit
 * account address identifies it on its own.
 **/
export interface StrategyPositionKey {
  chainId: ChainId;
  creditAccount: Address;
}

/**
 * {@link PoolPositionKey} tagged with its kind, for requests that accept both
 * kinds.
 **/
export interface PoolPositionRef extends PoolPositionKey {
  kind: "pool";
}

/**
 * {@link StrategyPositionKey} tagged with its kind, for requests that accept
 * both kinds.
 **/
export interface StrategyPositionRef extends StrategyPositionKey {
  kind: "strategy";
}

/**
 * Identifies any position that has a history, for requests that accept both
 * kinds. Liquidation positions have none: a delayed withdrawal is a single
 * event rather than a series.
 **/
export type PositionKey = PoolPositionRef | StrategyPositionRef;

/**
 * Aggregate over everything a wallet holds, served by the backend rather than
 * summed by a consumer: the list screen's badges. `null` where the wallet
 * holds nothing that contributes.
 **/
export interface PositionsTotals {
  /**
   * Blended rate the wallet's positions currently earn.
   **/
  currentYield: ApyBreakdown | null;
  /**
   * Profit and loss over every position, in USD terms of {@link PnlBreakdown}.
   **/
  pnl: PnlBreakdown | null;
  /**
   * Net value of every position in US dollars.
   **/
  netValueUsd: number | null;
  /**
   * What the wallet can claim right now (matured withdrawals, rewards) in US
   * dollars.
   **/
  claimableUsd: number | null;
}

/**
 * What a transaction did to a position.
 **/
export type PositionTransactionKind =
  | "open"
  | "deposit"
  | "withdraw"
  | "adjustLeverage"
  | "addCollateral"
  | "withdrawCollateral"
  | "liquidation";

/**
 * One transaction in a position's history, from the backend's indexer.
 **/
export interface PositionTransaction {
  txHash: Hex;
  /**
   * Unix seconds of the block the transaction was mined in.
   **/
  timestamp: Timestamp;
  kind: PositionTransactionKind;
  /**
   * Assets the transaction moved, in the direction the kind implies.
   **/
  assets: TokenAmount[];
}
