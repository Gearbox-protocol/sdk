import {
  ApproveWCOperation,
  FailedWCOperation,
  LpWCOperation,
  SwapWCOperation,
} from "./operations";

export * from "./operations";
export * from "./types";

export type AllWCOperations =
  | FailedWCOperation
  | ApproveWCOperation
  | SwapWCOperation
  | LpWCOperation;

export type SupportedWCOperations =
  | ApproveWCOperation
  | SwapWCOperation
  | LpWCOperation;

export class WcOperationCreator {
  static newSwapOperation = SwapWCOperation.create;
  static newLPOperation = LpWCOperation.create;
  static newUnsupportedOperation = FailedWCOperation.create;
  static newApproveOperation = ApproveWCOperation.create;
}
