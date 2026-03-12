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

export class ProtocolCallNotFoundError extends Error {
  public readonly targetContract: Address;
  public readonly executeIndex: number;
  constructor(targetContract: Address, executeIndex: number) {
    super(
      `protocol call to ${targetContract} not found in trace for Execute #${executeIndex}`,
    );
    this.name = "ProtocolCallNotFoundError";
    this.targetContract = targetContract;
    this.executeIndex = executeIndex;
  }
}

export class AdapterTraceAlignmentError extends Error {
  constructor(
    public readonly expected: number,
    public readonly actual: number,
  ) {
    super(`found ${actual} adapter traces for ${expected} execute events`);
    this.name = "AdapterTracesAlignmentError";
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
