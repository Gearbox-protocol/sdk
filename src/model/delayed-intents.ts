import type { Address } from "viem";

/**
 * App: 1.1 Deposit and 4.1 Adjust leverage — raise leverage at fixed collateral.
 * Borrow `underlying` -> swap `underlying` into `targetToken` (kept on CA).
 **/
export interface DelayedIncreaseLeverageIntent {
  type: "INCREASE_LEVERAGE";
}

/**
 * App: 1.2 Deposit — `amount > 0`, leverage = current (grow net value at same L).
 * Add collateral -> borrow `underlying` -> swap collateral and `underlying`
 * into the target token.
 **/
export interface DelayedDepositIntent {
  type: "DEPOSIT";
}

/**
 * App: 1.3 Deposit and Adjust leverage — `amount > 0`, leverage > current.
 * Add collateral -> borrow `underlying` -> swap collateral and `underlying`
 * into the target token.
 **/
export interface DelayedDepositAndIncreaseLeverageIntent {
  type: "DEPOSIT_AND_INCREASE_LEVERAGE";
}

/**
 * App: 2.1 Withdraw — withdraw selected token at fixed leverage.
 * Primary goal is `withdrawAmount` of `withdrawToken` (W of T). Debt cut is
 * residual from the claim/path after reserving W. `sourceToken` (S) funds the
 * delayed path; `debtRepaid` is 0 when debt was already repaid on start.
 **/
export interface DelayedWithdrawCollateralIntent {
  type: "WITHDRAW_COLLATERAL";
  /**
   * Wallet address that receives the withdrawn token
   * when the flow is resumed after the claim
   **/
  to: Address;
  /**
   * Token to withdraw from the credit account to the wallet after the claim
   **/
  withdrawToken: Address;
  /**
   * Amount of `withdrawToken` to withdraw to the wallet after the claim (W)
   **/
  withdrawAmount: bigint;
  /**
   * Token that funds the delayed path / debt conversion (S)
   **/
  sourceToken: Address;
  /**
   * Desired debt decrease in underlying units remaining for resume.
   * `0n` when debt was already repaid on the delayed-start branch.
   **/
  debtRepaid: bigint;
}

/**
 * App: 2.2 Withdraw — close account (receive leftover to wallet).
 **/
export interface DelayedCloseAccountIntent {
  type: "CLOSE_ACCOUNT";
  /**
   * Wallet address that receives leftover tokens when the account is closed
   * after the claim
   **/
  to: Address;
}

/**
 * App: 3.1 Add collateral — fixed debt.
 * Add collateral -> swap collateral into the target token.
 **/
export interface DelayedAddCollateralIntent {
  type: "ADD_COLLATERAL";
}

/**
 * App: 4.2 Adjust leverage — lower leverage at fixed collateral.
 * Swap source token into `underlying` -> decrease debt.
 **/
export interface DelayedDecreaseLeverageIntent {
  type: "DECREASE_LEVERAGE";
}

/**
 * Lean intent that is abi-encoded into `extraData` of a delayed withdrawal
 * request and decoded back when reading claimable withdrawals.
 *
 * It allows the app to resume a multi-step operation that was interrupted by
 * a delayed withdrawal: the intent records which operation was in progress
 * (and the minimal set of parameters that cannot be re-derived at claim time),
 * so that after the withdrawal is claimed, the remaining steps can be
 * previewed and executed.
 **/
export type DelayedIntent =
  | DelayedIncreaseLeverageIntent
  | DelayedDepositIntent
  | DelayedDepositAndIncreaseLeverageIntent
  | DelayedWithdrawCollateralIntent
  | DelayedCloseAccountIntent
  | DelayedAddCollateralIntent
  | DelayedDecreaseLeverageIntent;
