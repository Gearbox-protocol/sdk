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
}

export interface MulticallOperation extends OperationMetadata {
  operation: "MultiCall" | "BotMulticall";
  creditAccount: Address;
  multicall: InnerOperation[];
}

export interface OpenCreditAccountOperation extends OperationMetadata {
  operation: "OpenCreditAccount";
  creditAccount: Address;
  onBehalfOf: Address;
  referralCode: bigint;
  multicall: InnerOperation[];
}

export interface CloseCreditAccountOperation extends OperationMetadata {
  operation: "CloseCreditAccount";
  creditAccount: Address;
  multicall: InnerOperation[];
}

export interface LiquidateCreditAccountOperation extends OperationMetadata {
  operation: "LiquidateCreditAccount";
  creditAccount: Address;
  to: Address;
  remainingFunds: bigint;
  multicall: InnerOperation[];
}

export interface PartialLiquidationOperation extends OperationMetadata {
  operation: "PartiallyLiquidateCreditAccount";
  creditAccount: Address;
  token: Address;
  repaidAmount: bigint;
  minSeizedAmount: bigint;
  to: Address;
}

export interface DirectTokenTransferOperation extends OperationMetadata {
  operation: "DirectTokenTransfer";
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
