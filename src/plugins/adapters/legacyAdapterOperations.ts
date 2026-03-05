import type { Address } from "viem";

/**
 * Signed token balance changes for a credit account within a single Execute boundary.
 * Negative values = outflow, positive values = inflow.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/account_operation.go
 */
export type Transfers = Record<Address, bigint>;

/**
 * A token address paired with an amount.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/account_operation.go#L50-L53
 */
export interface TokenAmount {
  token: Address;
  amount: string;
}

/**
 * A simple swap: one token in, one token out.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/account_operation.go#L119-L124
 */
export interface BasicSwapCall {
  from: Address;
  fromAmount: string;
  to: Address;
  toAmount: string;
}

/** Default swap fallback for adapters without a specific override. */
export interface Swap extends BasicSwapCall {
  operation: "Swap";
}

/**
 * Uniswap V2/V3/V4 swap.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/account_operation.go#L132
 */
export interface UniswapSwap extends BasicSwapCall {
  operation: "UniswapSwap";
}

/**
 * Balancer V2/V3 swap.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type_v3.go#L106-L125
 */
export interface BalancerSwap extends BasicSwapCall {
  operation: "BalancerSwap";
}

/**
 * Curve pool exchange (any `exchange`* function).
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type.go#L132-L138
 */
export interface CurveExchange extends BasicSwapCall {
  operation: "CurveExchange";
}

/**
 * Curve remove liquidity to a single coin.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type.go#L139-L144
 */
export interface CurveRemoveLiquidityOneCoin extends BasicSwapCall {
  operation: "CurveRemoveLiquidityOneCoin";
}

/**
 * Curve add liquidity (multi-coin deposit into pool).
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type.go#L154-L164
 */
export interface CurveAddLiquidity {
  operation: "CurveAddLiquidity";
  addedLiquidity: TokenAmount[];
  lpToken: Address;
  lpAmount: string;
}

/**
 * Curve remove liquidity (multi-coin withdrawal from pool).
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type.go#L145-L153
 */
export interface CurveRemoveLiquidity {
  operation: "CurveRemoveLiquidity";
  tokenReceived: TokenAmount[];
  lpToken: Address;
  lpAmount: string;
}

/**
 * Curve reward claims (e.g. `withdrawAll(bool)` on BaseRewardPool).
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type_v3.go#L20-L23
 */
export interface CurveClaims {
  operation: "CurveClaims";
  claims: TokenAmount[];
}

/**
 * Curve/Convex booster withdrawal.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type_v3.go#L25
 */
export interface CurveWithdrawal extends BasicSwapCall {
  operation: "CurveWithdrawal";
}

/**
 * Convex deposit + stake in one operation.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/account_operation.go#L134-L138
 */
export interface ConvexDepositAndStake {
  operation: "ConvexDepositAndStake";
  depositToken: Address;
  depositAmount: string;
}

/**
 * Convex deposit without staking.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/account_operation.go#L139
 */
export interface ConvexDeposit extends BasicSwapCall {
  operation: "ConvexDeposit";
}

/**
 * Convex unstake/withdraw without claiming rewards.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/account_operation.go#L140-L144
 */
export interface ConvexWithdraw {
  operation: "ConvexWithdraw";
  withdrawToken: Address;
  withdrawAmount: string;
}

/**
 * Convex withdraw + claim rewards in one operation.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/account_operation.go#L145-L148
 */
export interface ConvexWithdrawAndClaim {
  operation: "ConvexWithdrawAndClaim";
  rewards: TokenAmount[];
}

/**
 * Convex stake (phantom token accounting).
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/account_operation.go#L149-L152
 */
export interface ConvexStake {
  operation: "ConvexStake";
  stakedToken: TokenAmount;
}

/**
 * Reward claim from Convex BaseRewardPool or similar.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type.go#L214-L226
 */
export interface GetReward {
  operation: "GetReward";
  rewards: TokenAmount[];
}

/**
 * Wrap stETH -> wstETH.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/account_operation.go#L171
 */
export interface WstETHWrap extends BasicSwapCall {
  operation: "WstETHWrap";
}

/**
 * Unwrap wstETH -> stETH.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/account_operation.go#L170
 */
export interface WstETHUnwrap extends BasicSwapCall {
  operation: "WstETHUnwrap";
}

/**
 * Lido ETH -> stETH submit.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/account_operation.go#L172
 */
export interface LidoSubmit extends BasicSwapCall {
  operation: "LidoSubmit";
}

/**
 * ERC4626 / generic vault deposit.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type_v3.go#L51-L56
 */
export interface VaultDeposit extends BasicSwapCall {
  operation: "VaultDeposit";
}

/**
 * ERC4626 / sDAI redeem.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/account_operation.go#L130
 */
export interface MakerRedeem extends BasicSwapCall {
  operation: "MakerRedeem";
}

/**
 * Deposit to vault / protocol where only the outflow (from CA) is visible.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/account_operation.go#L240-L245
 */
export interface MakerDeposit {
  operation: "MakerDeposit";
  token: Address;
  amount: string;
}

/**
 * Withdraw collateral from credit account (only inflow visible).
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type_v3.go#L162-L171
 */
export interface WithdrawCollateral {
  operation: "WithdrawCollateral";
  token: Address;
  amount: string;
}

/**
 * Union of all adapter-produced operation types.
 * Discriminated on the `operation` field.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/account_operation.go
 */
export type LegacyAdapterOperation =
  | Swap
  | UniswapSwap
  | BalancerSwap
  | CurveExchange
  | CurveRemoveLiquidityOneCoin
  | CurveAddLiquidity
  | CurveRemoveLiquidity
  | CurveClaims
  | CurveWithdrawal
  | ConvexDepositAndStake
  | ConvexDeposit
  | ConvexWithdraw
  | ConvexWithdrawAndClaim
  | ConvexStake
  | GetReward
  | WstETHWrap
  | WstETHUnwrap
  | LidoSubmit
  | VaultDeposit
  | MakerRedeem
  | MakerDeposit
  | WithdrawCollateral;
