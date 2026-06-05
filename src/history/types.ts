import type { LegacyAdapterOperation } from "../plugins/adapters/index.js";
import type {
  AdapterOperation as BaseAdapterOperation,
  CloseCreditAccountOperation as BaseCloseCreditAccountOperation,
  CreditAccountOperation as BaseCreditAccountOperation,
  InnerOperation as BaseInnerOperation,
  LiquidateCreditAccountOperation as BaseLiquidateCreditAccountOperation,
  MulticallOperation as BaseMulticallOperation,
  OpenCreditAccountOperation as BaseOpenCreditAccountOperation,
  OuterFacadeOperation as BaseOuterFacadeOperation,
  TraceAdapterExt,
} from "../preview/parse/index.js";

// Non-generic shared operation types are re-exported from `preview` unchanged
// so the `history` entry point keeps exposing them.
export type {
  AddCollateralOp,
  DecreaseDebtOp,
  DirectTokenTransferOperation,
  DirectTransferInfo,
  FacadeOperationMetadata,
  IncreaseDebtOp,
  InnerFacadeOperation,
  OperationMetadata,
  PartialLiquidationOperation,
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

export type AdapterOperation = BaseAdapterOperation<HistoryAdapterExt>;
export type InnerOperation = BaseInnerOperation<HistoryAdapterExt>;
export type MulticallOperation = BaseMulticallOperation<HistoryAdapterExt>;
export type OpenCreditAccountOperation =
  BaseOpenCreditAccountOperation<HistoryAdapterExt>;
export type CloseCreditAccountOperation =
  BaseCloseCreditAccountOperation<HistoryAdapterExt>;
export type LiquidateCreditAccountOperation =
  BaseLiquidateCreditAccountOperation<HistoryAdapterExt>;
export type OuterFacadeOperation = BaseOuterFacadeOperation<HistoryAdapterExt>;
export type CreditAccountOperation =
  BaseCreditAccountOperation<HistoryAdapterExt>;
