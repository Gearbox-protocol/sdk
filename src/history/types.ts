import type { LegacyAdapterOperation } from "../plugins/adapters/index.js";
import type {
  AdapterOperation as BaseAdapterOperation,
  CloseCreditAccountOperation as BaseCloseCreditAccountOperation,
  DirectTokenTransferOperation as BaseDirectTokenTransferOperation,
  InnerOperation as BaseInnerOperation,
  LiquidateCreditAccountOperation as BaseLiquidateCreditAccountOperation,
  MulticallOperation as BaseMulticallOperation,
  OpenCreditAccountOperation as BaseOpenCreditAccountOperation,
  PartialLiquidationOperation as BasePartialLiquidationOperation,
  FacadeOperationMetadata,
  OperationMetadata,
  TraceAdapterExt,
} from "../preview/parse/index.js";

// Non-generic shared operation types are re-exported from `preview` unchanged
// so the `history` entry point keeps exposing them.
export type {
  AddCollateralOp,
  DecreaseDebtOp,
  FacadeOperationMetadata,
  IncreaseDebtOp,
  InnerFacadeOperation,
  OperationMetadata,
  UpdateQuotaOp,
  WithdrawCollateralOp,
} from "../preview/parse/index.js";

/**
 * History-specific adapter-operation extension: trace-derived data
 * ({@link TraceAdapterExt}) plus the backward-compatible `legacy` classification
 * used by charts_server serialization. The `legacy` field lives only in
 * `history`; the base `preview` operations carry no `legacy`.
 */
export type HistoryAdapterExt = TraceAdapterExt & {
  legacy: LegacyAdapterOperation;
};

/**
 * Facade context available in `history` mode: the base facade metadata
 * (`creditManager`/`creditFacade`) plus the transaction-level
 * {@link OperationMetadata} that is only known once the transaction is mined.
 */
export type HistoryFacadeMetadata = FacadeOperationMetadata & OperationMetadata;

export type AdapterOperation = BaseAdapterOperation<HistoryAdapterExt>;
export type InnerOperation = BaseInnerOperation<HistoryAdapterExt>;

// Outer operations carry the transaction-level {@link OperationMetadata} only in
// `history` mode, so each history variant intersects its base type with it.
// `expectedBalanceChanges` is a calldata-only `preview` field (recovered from a
// router `storeExpectedBalances`/`compareBalances` pair); the trace-based
// `history` flow never populates it, so it is omitted from the type surface.
export type MulticallOperation = Omit<
  BaseMulticallOperation<HistoryAdapterExt>,
  "expectedBalanceChanges"
> &
  OperationMetadata;
export type OpenCreditAccountOperation = Omit<
  BaseOpenCreditAccountOperation<HistoryAdapterExt>,
  "expectedBalanceChanges"
> &
  OperationMetadata;
export type CloseCreditAccountOperation = Omit<
  BaseCloseCreditAccountOperation<HistoryAdapterExt>,
  "expectedBalanceChanges"
> &
  OperationMetadata;
export type LiquidateCreditAccountOperation = Omit<
  BaseLiquidateCreditAccountOperation<HistoryAdapterExt>,
  "expectedBalanceChanges"
> &
  OperationMetadata;
export type PartialLiquidationOperation = BasePartialLiquidationOperation &
  OperationMetadata;
export type DirectTokenTransferOperation = BaseDirectTokenTransferOperation &
  OperationMetadata;

export type OuterFacadeOperation =
  | MulticallOperation
  | OpenCreditAccountOperation
  | CloseCreditAccountOperation
  | LiquidateCreditAccountOperation
  | PartialLiquidationOperation;
export type CreditAccountOperation =
  | OuterFacadeOperation
  | DirectTokenTransferOperation;
