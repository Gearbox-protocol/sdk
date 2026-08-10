import type { Address } from "viem";
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
  Token,
  TokenAmount,
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
   * What the position has earned so far.
   *
   * @mode offchain
   **/
  pnl?: PnlBreakdown;
}

/**
 * An open credit account of a wallet.
 **/
export interface StrategyPosition {
  /**
   * Discriminates this position from the other kinds a wallet can hold.
   **/
  kind: "strategy";
  /**
   * Human-readable strategy name, e.g. `"wstETH / WETH"`.
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
   * The account's dominant non-underlying collateral at the session's opening
   * block (greatest opening-block USD value) — the asset the position was
   * initially leveraged into. `null` when the opening snapshot holds only the
   * underlying.
   **/
  targetCollateral: Token | null;
  /**
   * Debt/equity ratio: `totalDebt / equity` (`equity = totalValue −
   * totalDebt`). `0` = unleveraged; `0` if underwater. Same notation as the
   * opportunity `maxLeverage`, and bounded by it.
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
   * Net rate the whole position is currently earning, i.e. the collateral's
   * yield at this {@link leverage} minus the cost of the debt carrying it.
   *
   * Absent in `onchain` mode: its collateral yield term is.
   *
   * @mode offchain
   **/
  netApy?: ApyBreakdown;
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
}

/**
 * A row of the positions list: anything a wallet holds in the protocol.
 **/
export type Position = PoolPosition | StrategyPosition | LiquidationPosition;

/**
 * Optional narrowing of a positions list.
 *
 * Every criterion is optional and an omitted one matches any value, so an empty
 * filter is the same as no filter at all. Criteria combine with AND.
 **/
export interface PositionFilter {
  /**
   * Keep only positions of this kind.
   **/
  kind?: PositionKind;
  /**
   * Keep only credit accounts that carry no debt, or only the ones that do.
   * Applicable only to {@link StrategyPosition}
   **/
  isZeroDebt?: boolean;
  /**
   * Keep only positions on these chains.
   **/
  chainIds?: ChainId[];
  /**
   * Keep only positions whose underlying is of this class, which for an RWA
   * market means the class of the token its wrapper holds.
   *
   * Not applicable to {@link LiquidationPosition}
   **/
  underlyingType?: AssetType;
}
