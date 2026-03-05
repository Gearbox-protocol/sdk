import type { Address, Hex } from "viem";
import type { InnerOperation } from "./inner-operations.js";
import type { CreditAccountOperation, OuterFacadeOperation } from "./types.js";

/**
 * JSON-serializable representation of a top-level legacy API operation.
 * Mirrors the shape returned by charts-server's `/operations` endpoint,
 * but omits fields the new parser cannot produce (sessionId, timestamp,
 * protocol on inner ops, initialFunds/userFunds/leverage).
 */
export interface LegacyApiOperation {
  operation: string;
  txHash: Hex;
  blockNum: number;
  [key: string]: unknown;
}

/**
 * JSON-serializable representation of an inner multicall operation
 * from the legacy API.
 */
export interface LegacyMulticallOp {
  operation: string;
  [key: string]: unknown;
}

function convertMulticallOp(op: InnerOperation): LegacyMulticallOp {
  if ("legacy" in op) {
    return { ...op.legacy };
  }
  switch (op.operation) {
    case "IncreaseBorrowedAmount":
      return {
        operation: op.operation,
        amount: op.amount.toString(),
      };
    case "DecreaseBorrowedAmount":
      return {
        operation: op.operation,
        amount: op.amount.toString(),
      };
    case "AddCollateral":
      return {
        operation: op.operation,
        token: op.token,
        amount: op.amount.toString(),
      };
    case "WithdrawCollateral":
      return {
        operation: op.operation,
        token: op.token,
        amount: op.amount.toString(),
        to: op.to,
        ...(op.phantomToken ? { phantomToken: op.phantomToken } : {}),
      };
    case "UpdateQuota":
      return {
        operation: op.operation,
        token: op.token,
        change: op.change.toString(),
      };
  }
}

function convertFacadeOp(op: OuterFacadeOperation): LegacyApiOperation {
  const base: LegacyApiOperation = {
    operation: op.operation,
    txHash: op.txHash,
    blockNum: op.blockNumber,
  };

  switch (op.operation) {
    case "MultiCall":
    case "BotMulticall":
      return {
        ...base,
        multicall: op.multicall.map(convertMulticallOp),
      };
    case "OpenCreditAccount":
      return {
        ...base,
        multicall: op.multicall.map(convertMulticallOp),
      };
    case "CloseCreditAccount":
      return {
        ...base,
        multicall: op.multicall.map(convertMulticallOp),
      };
    case "LiquidateCreditAccount":
      return {
        ...base,
        to: op.to,
        remainingFunds: op.remainingFunds.toString(),
        multicall: op.multicall.map(convertMulticallOp),
      };
    case "PartiallyLiquidateCreditAccount":
      return {
        ...base,
        token: op.token,
        repaidAmount: op.repaidAmount.toString(),
        minSeizedAmount: op.minSeizedAmount.toString(),
        to: op.to,
      };
  }
}

/**
 * Converts new parser output to the legacy API format for comparison.
 *
 * The returned objects use string amounts (not bigint) and `blockNum`
 * (not `blockNumber`), matching the charts-server JSON shape.
 *
 * Fields that only exist in the old API and cannot be derived from the
 * new parser output are omitted: `sessionId`, `timestamp`, `protocol`
 * on all operations, and `initialFunds`/`userFunds`/`leverage` on
 * OpenCreditAccount.
 */
export function toLegacyOperations(
  ops: CreditAccountOperation[],
): LegacyApiOperation[] {
  return ops.map(op => {
    if (op.operation === "DirectTokenTransfer") {
      return {
        operation: op.operation,
        txHash: op.txHash,
        blockNum: op.blockNumber,
        token: op.token,
        amount: op.amount.toString(),
        from: op.from,
        to: op.creditAccount as Address,
      };
    }
    return convertFacadeOp(op);
  });
}
