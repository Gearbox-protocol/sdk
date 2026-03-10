import type { AdapterOperation } from "../plugins/adapters/index.js";
import type {
  AddCollateralOp,
  DecreaseDebtOp,
  IncreaseDebtOp,
  InnerOperation,
  UpdateQuotaOp,
  WithdrawCollateralOp,
} from "./inner-operations.js";
import type {
  CloseCreditAccountOperation,
  CreditAccountOperation,
  DirectTokenTransferOperation,
  FacadeOperationMetadata,
  LiquidateCreditAccountOperation,
  MulticallOperation,
  OpenCreditAccountOperation,
  PartialLiquidationOperation,
} from "./types.js";

/**
 * Visitor that maps each operation node in a {@link CreditAccountOperation}
 * tree to a new representation.
 *
 */
export interface OperationVisitor<TInner, TOuter> {
  Execute(op: AdapterOperation, ctx: FacadeOperationMetadata): TInner;
  IncreaseBorrowedAmount(
    op: IncreaseDebtOp,
    ctx: FacadeOperationMetadata,
  ): TInner;
  DecreaseBorrowedAmount(
    op: DecreaseDebtOp,
    ctx: FacadeOperationMetadata,
  ): TInner;
  AddCollateral(op: AddCollateralOp, ctx: FacadeOperationMetadata): TInner;
  WithdrawCollateral(
    op: WithdrawCollateralOp,
    ctx: FacadeOperationMetadata,
  ): TInner;
  UpdateQuota(op: UpdateQuotaOp, ctx: FacadeOperationMetadata): TInner;

  DirectTokenTransfer(op: DirectTokenTransferOperation): TOuter;
  MultiCall(op: MulticallOperation, multicall: TInner[]): TOuter;
  OpenCreditAccount(
    op: OpenCreditAccountOperation,
    multicall: TInner[],
  ): TOuter;
  CloseCreditAccount(
    op: CloseCreditAccountOperation,
    multicall: TInner[],
  ): TOuter;
  LiquidateCreditAccount(
    op: LiquidateCreditAccountOperation,
    multicall: TInner[],
  ): TOuter;
  PartiallyLiquidateCreditAccount(op: PartialLiquidationOperation): TOuter;
}

function mapInnerOperation<TInner>(
  op: InnerOperation,
  visitor: Pick<
    OperationVisitor<TInner, unknown>,
    | "Execute"
    | "IncreaseBorrowedAmount"
    | "DecreaseBorrowedAmount"
    | "AddCollateral"
    | "WithdrawCollateral"
    | "UpdateQuota"
  >,
  ctx: FacadeOperationMetadata,
): TInner {
  switch (op.operation) {
    case "Execute":
      return visitor.Execute(op, ctx);
    case "IncreaseBorrowedAmount":
      return visitor.IncreaseBorrowedAmount(op, ctx);
    case "DecreaseBorrowedAmount":
      return visitor.DecreaseBorrowedAmount(op, ctx);
    case "AddCollateral":
      return visitor.AddCollateral(op, ctx);
    case "WithdrawCollateral":
      return visitor.WithdrawCollateral(op, ctx);
    case "UpdateQuota":
      return visitor.UpdateQuota(op, ctx);
  }
}

function mapOuterOperation<TInner, TOuter>(
  op: CreditAccountOperation,
  visitor: OperationVisitor<TInner, TOuter>,
): TOuter {
  switch (op.operation) {
    case "DirectTokenTransfer":
      return visitor.DirectTokenTransfer(op);
    case "PartiallyLiquidateCreditAccount":
      return visitor.PartiallyLiquidateCreditAccount(op);
    case "MultiCall":
    case "BotMulticall": {
      const multicall = op.multicall.map(inner =>
        mapInnerOperation(inner, visitor, op),
      );
      return visitor.MultiCall(op, multicall);
    }
    case "OpenCreditAccount": {
      const multicall = op.multicall.map(inner =>
        mapInnerOperation(inner, visitor, op),
      );
      return visitor.OpenCreditAccount(op, multicall);
    }
    case "CloseCreditAccount": {
      const multicall = op.multicall.map(inner =>
        mapInnerOperation(inner, visitor, op),
      );
      return visitor.CloseCreditAccount(op, multicall);
    }
    case "LiquidateCreditAccount": {
      const multicall = op.multicall.map(inner =>
        mapInnerOperation(inner, visitor, op),
      );
      return visitor.LiquidateCreditAccount(op, multicall);
    }
  }
}

/**
 * Walks a list of {@link CreditAccountOperation}s, mapping each node via the
 * given visitor
 */
export function mapOperations<TInner, TOuter>(
  ops: CreditAccountOperation[],
  visitor: OperationVisitor<TInner, TOuter>,
): TOuter[] {
  return ops.map(op => mapOuterOperation(op, visitor));
}
