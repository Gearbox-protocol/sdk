import type { Address, Hex } from "viem";

import type { InnerOperation } from "./inner-operations.js";

/**
 * An ERC-20 Transfer to the credit account that was not part of any
 * facade operation (multicall, liquidation, etc.).
 */
export interface DirectTransferInfo {
  token: Address;
  from: Address;
  amount: bigint;
}

export interface OperationMetadata {
  txHash: Hex;
  blockNumber: number;
  timestamp: number;
}

export interface FacadeOperationMetadata extends OperationMetadata {
  creditFacade: Address;
}

export interface MulticallOperation extends FacadeOperationMetadata {
  operation: "MultiCall" | "BotMulticall";
  creditAccount: Address;
  multicall: InnerOperation[];
}

export interface OpenCreditAccountOperation extends FacadeOperationMetadata {
  operation: "OpenCreditAccount";
  creditAccount: Address;
  onBehalfOf: Address;
  referralCode: bigint;
  multicall: InnerOperation[];
}

export interface CloseCreditAccountOperation extends FacadeOperationMetadata {
  operation: "CloseCreditAccount";
  creditAccount: Address;
  multicall: InnerOperation[];
}

export interface LiquidateCreditAccountOperation
  extends FacadeOperationMetadata {
  operation: "LiquidateCreditAccount";
  creditAccount: Address;
  to: Address;
  token: Address;
  remainingFunds: bigint;
  multicall: InnerOperation[];
}

export interface PartialLiquidationOperation extends FacadeOperationMetadata {
  operation: "PartiallyLiquidateCreditAccount";
  creditAccount: Address;
  token: Address;
  repaidAmount: bigint;
  minSeizedAmount: bigint;
  to: Address;
}

export interface DirectTokenTransferOperation extends OperationMetadata {
  operation: "DirectTokenTransfer";
  protocol: Address;
  token: Address;
  from: Address;
  creditAccount: Address;
  amount: bigint;
}

/**
 * Discriminated union of all facade-level operation types.
 * One per facade entry-point call within a transaction.
 */
export type OuterFacadeOperation =
  | MulticallOperation
  | OpenCreditAccountOperation
  | CloseCreditAccountOperation
  | LiquidateCreditAccountOperation
  | PartialLiquidationOperation;

/**
 * Discriminated union of all credit account operation types
 * (facade operations + direct token transfers).
 */
export type CreditAccountOperation =
  | OuterFacadeOperation
  | DirectTokenTransferOperation;
