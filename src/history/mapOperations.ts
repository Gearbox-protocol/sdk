import type {
  AdapterOperation,
  AddCollateralOp,
  CloseCreditAccountOperation,
  CreditAccountOperation,
  DecreaseDebtOp,
  DirectTokenTransferOperation,
  HistoryFacadeMetadata,
  IncreaseDebtOp,
  InnerOperation,
  LiquidateCreditAccountOperation,
  MulticallOperation,
  OpenCreditAccountOperation,
  PartialLiquidationOperation,
  UpdateQuotaOp,
  WithdrawCollateralOp,
} from "./types.js";

/**
 * Visitor that maps each operation node in a {@link CreditAccountOperation}
 * tree to a new representation.
 *
 */
export interface OperationVisitor<TInner, TOuter> {
  Execute(op: AdapterOperation, ctx: HistoryFacadeMetadata): TInner;
  IncreaseBorrowedAmount(
    op: IncreaseDebtOp,
    ctx: HistoryFacadeMetadata,
  ): TInner;
  DecreaseBorrowedAmount(
    op: DecreaseDebtOp,
    ctx: HistoryFacadeMetadata,
  ): TInner;
  AddCollateral(op: AddCollateralOp, ctx: HistoryFacadeMetadata): TInner;
  WithdrawCollateral(
    op: WithdrawCollateralOp,
    ctx: HistoryFacadeMetadata,
  ): TInner;
  UpdateQuota(op: UpdateQuotaOp, ctx: HistoryFacadeMetadata): TInner;

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
  ctx: HistoryFacadeMetadata,
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
    // The history classifier never emits other InnerOperation variants
    // (e.g. StoreExpectedBalances/CompareBalances, which it drops), so this
    // guards against silently returning undefined if that ever changes.
    default:
      throw new Error(
        `unexpected inner operation: ${(op as InnerOperation).operation}`,
      );
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
