import type { Address } from "viem";
import type { AdapterOperation } from "../plugins/adapters/index.js";

/**
 * Increase debt (borrow more).
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type_v3.go#L149-L154
 */
export interface IncreaseDebtOp {
  operation: "IncreaseBorrowedAmount";
  token: Address;
  amount: bigint;
}

/**
 * Decrease debt (repay).
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type_v3.go#L155-L161
 */
export interface DecreaseDebtOp {
  operation: "DecreaseBorrowedAmount";
  token: Address;
  amount: bigint;
}

/**
 * Add collateral to credit account.
 */
export interface AddCollateralOp {
  operation: "AddCollateral";
  token: Address;
  amount: bigint;
}

/**
 * Withdraw collateral from credit account.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type_v3.go#L162-L171
 */
export interface WithdrawCollateralOp {
  operation: "WithdrawCollateral";
  token: Address;
  amount: bigint;
  to: Address;
  phantomToken?: Address;
}

/**
 * Update token quota on credit account.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type_v3.go#L172-L178
 */
export interface UpdateQuotaOp {
  operation: "UpdateQuota";
  token: Address;
  change: bigint;
}

/**
 * Union of facade inner-call operation types (non-adapter credit account operations).
 * Discriminated on the `operation` field.
 */
export type InnerFacadeOperation =
  | IncreaseDebtOp
  | DecreaseDebtOp
  | AddCollateralOp
  | WithdrawCollateralOp
  | UpdateQuotaOp;

/**
 * All operations that can happen within a CreditFacade's multicall and that we're interested in.
 */
export type InnerOperation = AdapterOperation | InnerFacadeOperation;
