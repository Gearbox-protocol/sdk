import type { Address, Hex } from "viem";

import type { AdapterOperation } from "./types-adapters.js";

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
 *
 * Generic over the adapter-operation extension `Ext` (see {@link AdapterOperation}).
 */
export type InnerOperation<Ext extends object = {}> =
  | AdapterOperation<Ext>
  | InnerFacadeOperation;

/**
 * Transaction-level metadata available only when parsing a mined transaction
 * (the `history` mode). It is intentionally absent from base `preview`
 * operations, which describe not-yet-mined calls where these values are unknown.
 */
export interface OperationMetadata {
  txHash: Hex;
  blockNumber: number;
  timestamp: number;
}

export interface FacadeOperationMetadata {
  creditManager: Address;
  creditFacade: Address;
}

/**
 * Signed token balance delta recovered from a router-generated
 * `storeExpectedBalances` call (the `BalanceDelta` struct). `amount` is the
 * signed `int256` delta, so it may be negative.
 */
export interface ExpectedBalanceChange {
  token: Address;
  delta: bigint;
}

export interface MulticallOperation<Ext extends object = {}>
  extends FacadeOperationMetadata {
  operation: "MultiCall" | "BotMulticall";
  creditAccount: Address;
  multicall: InnerOperation<Ext>[];
  /**
   * Potential balance changes declared by a router-generated
   * `storeExpectedBalances`/`compareBalances` pair, or `undefined` when the
   * multicall is not router-shaped. See {@link ExpectedBalanceChange}.
   */
  expectedBalanceChanges?: ExpectedBalanceChange[];
}

export interface OpenCreditAccountOperation<Ext extends object = {}>
  extends FacadeOperationMetadata {
  operation: "OpenCreditAccount";
  creditAccount: Address;
  onBehalfOf: Address;
  referralCode: bigint;
  multicall: InnerOperation<Ext>[];
  /**
   * Potential balance changes declared by a router-generated
   * `storeExpectedBalances`/`compareBalances` pair, or `undefined` when the
   * multicall is not router-shaped. See {@link ExpectedBalanceChange}.
   */
  expectedBalanceChanges?: ExpectedBalanceChange[];
}

export interface CloseCreditAccountOperation<Ext extends object = {}>
  extends FacadeOperationMetadata {
  operation: "CloseCreditAccount";
  creditAccount: Address;
  multicall: InnerOperation<Ext>[];
  /**
   * Potential balance changes declared by a router-generated
   * `storeExpectedBalances`/`compareBalances` pair, or `undefined` when the
   * multicall is not router-shaped. See {@link ExpectedBalanceChange}.
   */
  expectedBalanceChanges?: ExpectedBalanceChange[];
}

export interface LiquidateCreditAccountOperation<Ext extends object = {}>
  extends FacadeOperationMetadata {
  operation: "LiquidateCreditAccount";
  creditAccount: Address;
  to: Address;
  token: Address;
  remainingFunds: bigint;
  multicall: InnerOperation<Ext>[];
  /**
   * Potential balance changes declared by a router-generated
   * `storeExpectedBalances`/`compareBalances` pair, or `undefined` when the
   * multicall is not router-shaped. See {@link ExpectedBalanceChange}.
   */
  expectedBalanceChanges?: ExpectedBalanceChange[];
}

export interface PartialLiquidationOperation extends FacadeOperationMetadata {
  operation: "PartiallyLiquidateCreditAccount";
  creditAccount: Address;
  token: Address;
  repaidAmount: bigint;
  minSeizedAmount: bigint;
  to: Address;
}

export interface DirectTokenTransferOperation {
  operation: "DirectTokenTransfer";
  protocol: Address;
  token: Address;
  from: Address;
  to: Address;
  creditAccount: Address;
  amount: bigint;
}

/**
 * Discriminated union of all facade-level operation types.
 * One per facade entry-point call within a transaction.
 */
export type OuterFacadeOperation<Ext extends object = {}> =
  | MulticallOperation<Ext>
  | OpenCreditAccountOperation<Ext>
  | CloseCreditAccountOperation<Ext>
  | LiquidateCreditAccountOperation<Ext>
  | PartialLiquidationOperation;

/**
 * Discriminated union of all credit account operation types
 * (facade operations + direct token transfers).
 */
export type CreditAccountOperation<Ext extends object = {}> =
  | OuterFacadeOperation<Ext>
  | DirectTokenTransferOperation;
