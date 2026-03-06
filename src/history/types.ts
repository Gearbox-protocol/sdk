import type { Address, Hex } from "viem";

import type { InnerOperation } from "./inner-operations.js";

/**
 * An ERC-20 Transfer to the credit account that was not part of any
 * facade operation (multicall, liquidation, etc.).
 */
export interface DirectTransferInfo<TToken = Address> {
  token: TToken;
  from: Address;
  amount: bigint;
}

export interface OperationMetadata {
  txHash: Hex;
  blockNumber: number;
}

export interface MulticallOperation<TToken = Address>
  extends OperationMetadata {
  operation: "MultiCall" | "BotMulticall";
  creditAccount: Address;
  multicall: InnerOperation<TToken>[];
}

export interface OpenCreditAccountOperation<TToken = Address>
  extends OperationMetadata {
  operation: "OpenCreditAccount";
  creditAccount: Address;
  onBehalfOf: Address;
  referralCode: bigint;
  multicall: InnerOperation<TToken>[];
}

export interface CloseCreditAccountOperation<TToken = Address>
  extends OperationMetadata {
  operation: "CloseCreditAccount";
  creditAccount: Address;
  multicall: InnerOperation<TToken>[];
}

export interface LiquidateCreditAccountOperation<TToken = Address>
  extends OperationMetadata {
  operation: "LiquidateCreditAccount";
  creditAccount: Address;
  to: Address;
  token: TToken;
  remainingFunds: bigint;
  multicall: InnerOperation<TToken>[];
}

export interface PartialLiquidationOperation<TToken = Address>
  extends OperationMetadata {
  operation: "PartiallyLiquidateCreditAccount";
  creditAccount: Address;
  token: TToken;
  repaidAmount: bigint;
  minSeizedAmount: bigint;
  to: Address;
}

export interface DirectTokenTransferOperation<TToken = Address>
  extends OperationMetadata {
  operation: "DirectTokenTransfer";
  token: TToken;
  from: Address;
  creditAccount: Address;
  amount: bigint;
}

/**
 * Discriminated union of all facade-level operation types.
 * One per facade entry-point call within a transaction.
 */
export type OuterFacadeOperation<TToken = Address> =
  | MulticallOperation<TToken>
  | OpenCreditAccountOperation<TToken>
  | CloseCreditAccountOperation<TToken>
  | LiquidateCreditAccountOperation<TToken>
  | PartialLiquidationOperation<TToken>;

/**
 * Discriminated union of all credit account operation types
 * (facade operations + direct token transfers).
 */
export type CreditAccountOperation<TToken = Address> =
  | OuterFacadeOperation<TToken>
  | DirectTokenTransferOperation<TToken>;
