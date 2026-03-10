import type { Address, Hex } from "viem";
import { mapOperations, type OperationVisitor } from "./mapOperations.js";
import type { CreditAccountOperation } from "./types.js";

export interface LegacyApiOperation {
  operation: string;
  txHash: Hex;
  blockNum: number;
  [key: string]: unknown;
}

export interface LegacyMulticallOp {
  operation: string;
  [key: string]: unknown;
}

export const legacyVisitor: OperationVisitor<
  LegacyMulticallOp,
  LegacyApiOperation
> = {
  Execute(op) {
    return { ...op.legacy };
  },
  IncreaseBorrowedAmount(op) {
    return {
      operation: op.operation,
      amount: op.amount.toString(),
    };
  },
  DecreaseBorrowedAmount(op) {
    return {
      operation: op.operation,
      amount: op.amount.toString(),
    };
  },
  AddCollateral(op) {
    return {
      operation: op.operation,
      token: op.token,
      amount: op.amount.toString(),
    };
  },
  WithdrawCollateral(op) {
    return {
      operation: op.operation,
      token: op.token,
      amount: op.amount.toString(),
      to: op.to,
      ...(op.phantomToken ? { phantomToken: op.phantomToken } : {}),
    };
  },
  UpdateQuota(op) {
    return {
      operation: op.operation,
      token: op.token,
      change: op.change.toString(),
    };
  },

  DirectTokenTransfer(op) {
    return {
      operation: op.operation,
      txHash: op.txHash,
      blockNum: op.blockNumber,
      token: op.token,
      amount: op.amount.toString(),
      from: op.from,
      to: op.creditAccount as Address,
    };
  },
  MultiCall(op, multicall) {
    return {
      operation: op.operation,
      txHash: op.txHash,
      blockNum: op.blockNumber,
      multicall,
    };
  },
  OpenCreditAccount(op, multicall) {
    return {
      operation: op.operation,
      txHash: op.txHash,
      blockNum: op.blockNumber,
      multicall,
    };
  },
  CloseCreditAccount(op, multicall) {
    return {
      operation: op.operation,
      txHash: op.txHash,
      blockNum: op.blockNumber,
      multicall,
    };
  },
  LiquidateCreditAccount(op, multicall) {
    return {
      operation: op.operation,
      txHash: op.txHash,
      blockNum: op.blockNumber,
      to: op.to,
      remainingFunds: op.remainingFunds.toString(),
      multicall,
    };
  },
  PartiallyLiquidateCreditAccount(op) {
    return {
      operation: op.operation,
      txHash: op.txHash,
      blockNum: op.blockNumber,
      token: op.token,
      repaidAmount: op.repaidAmount.toString(),
      minSeizedAmount: op.minSeizedAmount.toString(),
      to: op.to,
    };
  },
};

/**
 * Converts new parser output to the legacy API format for comparison.
 *
 * Missing `initialFunds`/`userFunds`/`leverage` on OpenCreditAccount.
 */
export function toLegacyOperations(
  ops: CreditAccountOperation[],
): LegacyApiOperation[] {
  return mapOperations(ops, legacyVisitor);
}
