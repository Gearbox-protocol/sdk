import type { Address, Hex } from "viem";

export class UnknownAdapterError extends Error {
  public readonly address: Address;
  constructor(address: Address) {
    super(`unknown adapter contract ${address}`);
    this.name = "UnknownAdapterError";
    this.address = address;
  }
}

export class TransferAlignmentError extends Error {
  constructor(expected: number, actual: number) {
    super(
      `transfer alignment mismatch: expected ${expected} Execute transfers, consumed ${actual}`,
    );
    this.name = "TransferAlignmentError";
  }
}

export class WithdrawCollateralAlignmentError extends Error {
  constructor(expected: number, actual: number) {
    super(
      `withdrawCollateral event alignment mismatch: expected ${expected} events, consumed ${actual}`,
    );
    this.name = "WithdrawCollateralAlignmentError";
  }
}

export class UnexpectedFacadeEventOrderError extends Error {
  constructor(e: {
    eventName: string;
    logIndex: number;
    transactionHash: Hex;
  }) {
    super(
      `unexpected facade event order: ${e.eventName} at ${e.logIndex} in ${e.transactionHash}`,
    );
    this.name = "UnexpectedFacadeEventOrderError";
  }
}

export class UnknownFacadeCallError extends Error {
  public readonly address: Address;
  public readonly functionName: string;
  constructor(address: Address, functionName: string) {
    super(`unknown facade call "${functionName}" at ${address}`);
    this.name = "UnknownFacadeCallError";
    this.address = address;
    this.functionName = functionName;
  }
}
