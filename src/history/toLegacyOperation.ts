import type { Address, Hex } from "viem";
import { mapOperations, type OperationVisitor } from "./mapOperations.js";
import type {
  CreditAccountOperation,
  FacadeOperationMetadata,
} from "./types.js";

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

export interface LegacyVisitorParams {
  sessionId: string;
}

function commonFields(
  op: FacadeOperationMetadata,
  params: LegacyVisitorParams,
) {
  return {
    timestamp: op.timestamp,
    sessionId: params.sessionId,
    protocol: op.creditFacade,
  };
}

export function createLegacyVisitor(
  params: LegacyVisitorParams,
): OperationVisitor<LegacyMulticallOp, LegacyApiOperation> {
  return {
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
        timestamp: op.timestamp,
        sessionId: params.sessionId,
        protocol: op.protocol,
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
        ...commonFields(op, params),
        multicall,
      };
    },
    OpenCreditAccount(op, multicall) {
      return {
        operation: op.operation,
        txHash: op.txHash,
        blockNum: op.blockNumber,
        ...commonFields(op, params),
        // TODO: missing legacy fields:
        // userFunds: require prices to compute as
        // sum of AddCollateral/WithdrawCollateral amounts denominated in underlying token.
        // initialFunds: === userFunds
        //
        // leverage: (userFunds + borrowAmount) / userFunds
        // where borrowAmount = sum of IncreaseDebt amounts in multicall (computable from data)
        multicall,
      };
    },
    CloseCreditAccount(op, multicall) {
      return {
        operation: op.operation,
        txHash: op.txHash,
        blockNum: op.blockNumber,
        ...commonFields(op, params),
        // TODO: missing legacy fields:
        // remainingFunds:
        multicall,
      };
    },
    LiquidateCreditAccount(op, multicall) {
      return {
        operation: op.operation,
        txHash: op.txHash,
        blockNum: op.blockNumber,
        ...commonFields(op, params),
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
        ...commonFields(op, params),
        token: op.token,
        repaidAmount: op.repaidAmount.toString(),
        minSeizedAmount: op.minSeizedAmount.toString(),
        to: op.to,
      };
    },
  };
}

export function toLegacyOperations(
  ops: CreditAccountOperation[],
  params: LegacyVisitorParams,
): LegacyApiOperation[] {
  return mapOperations(ops, createLegacyVisitor(params));
}
