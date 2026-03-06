import type { Address } from "viem";
import type { AdapterOperation } from "../plugins/adapters/index.js";

/**
 * Increase debt (borrow more).
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type_v3.go#L149-L154
 */
export interface IncreaseDebtOp<TToken = Address> {
  operation: "IncreaseBorrowedAmount";
  token: TToken;
  amount: bigint;
}

/**
 * Decrease debt (repay).
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type_v3.go#L155-L161
 */
export interface DecreaseDebtOp<TToken = Address> {
  operation: "DecreaseBorrowedAmount";
  token: TToken;
  amount: bigint;
}

/**
 * Add collateral to credit account.
 */
export interface AddCollateralOp<TToken = Address> {
  operation: "AddCollateral";
  token: TToken;
  amount: bigint;
}

/**
 * Withdraw collateral from credit account.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type_v3.go#L162-L171
 */
export interface WithdrawCollateralOp<TToken = Address> {
  operation: "WithdrawCollateral";
  token: TToken;
  amount: bigint;
  to: Address;
  phantomToken?: TToken;
}

/**
 * Update token quota on credit account.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type_v3.go#L172-L178
 */
export interface UpdateQuotaOp<TToken = Address> {
  operation: "UpdateQuota";
  token: TToken;
  change: bigint;
}

/**
 * Union of facade inner-call operation types (non-adapter credit account operations).
 * Discriminated on the `operation` field.
 */
export type InnerFacadeOperation<TToken = Address> =
  | IncreaseDebtOp<TToken>
  | DecreaseDebtOp<TToken>
  | AddCollateralOp<TToken>
  | WithdrawCollateralOp<TToken>
  | UpdateQuotaOp<TToken>;

/**
 * All operations that can happen within a CreditFacade's multicall and that we're interested in.
 */
export type InnerOperation<TToken = Address> =
  | AdapterOperation<TToken>
  | InnerFacadeOperation<TToken>;
