/**
 * Findings of an action's `check` step.
 *
 * `check` runs against the state right before the action and answers: would
 * this action revert on chain, or do nothing, given everything recorded
 * before it? An `error` stops the projection at that action — the batch would
 * revert there — and makes `build()` and `simulate()` reject; a `warning` is
 * reported and the projection goes on.
 **/
import { BaseError } from "viem";

export type ActionDiagnosticSeverity = "error" | "warning";

/** Path of the offending param, e.g. `["params", "feeLiquidation"]`. **/
export type ActionDiagnosticPath = readonly (string | number)[];

export interface ActionDiagnostic {
  severity: ActionDiagnosticSeverity;
  /** Stable, machine-readable code, e.g. `LT_ABOVE_UNDERLYING`. **/
  code: string;
  message: string;
  path?: ActionDiagnosticPath;
}

/** An {@link ActionDiagnostic} located in a list of actions. **/
export interface GipActionDiagnostic extends ActionDiagnostic {
  actionIndex: number;
  actionType: string;
}

function diagnostic(
  severity: ActionDiagnosticSeverity,
  code: string,
  message: string,
  path?: ActionDiagnosticPath,
): ActionDiagnostic {
  return { severity, code, message, ...(path ? { path } : {}) };
}

export function actionError(
  code: string,
  message: string,
  path?: ActionDiagnosticPath,
): ActionDiagnostic {
  return diagnostic("error", code, message, path);
}

export function actionWarning(
  code: string,
  message: string,
  path?: ActionDiagnosticPath,
): ActionDiagnostic {
  return diagnostic("warning", code, message, path);
}

/** Code of an {@link incompleteCheck}. **/
export const CHECK_UNAVAILABLE = "CHECK_UNAVAILABLE";

/** Reported separately as incompleteChecks by the executor. **/
export function incompleteCheck(
  check: string,
  reason: string,
): ActionDiagnostic {
  return actionWarning(CHECK_UNAVAILABLE, `${check}: ${reason}`);
}

/** Locates `diagnostics` of the action at `actionIndex`. **/
export function locateDiagnostics(
  diagnostics: readonly ActionDiagnostic[],
  actionIndex: number,
  actionType: string,
): GipActionDiagnostic[] {
  return diagnostics.map(diagnostic => ({
    ...diagnostic,
    actionIndex,
    actionType,
  }));
}

export function hasErrors(diagnostics: readonly ActionDiagnostic[]): boolean {
  return diagnostics.some(diagnostic => diagnostic.severity === "error");
}

/**
 * Raised when an action list cannot be built because an action's `check`
 * found an error. `code`, `actionIndex`, `actionType` and `path` describe the
 * first error; `diagnostics` holds every finding up to and including that action.
 **/
export class GipActionError extends BaseError {
  override name = "GipActionError";
  readonly code: string;
  readonly actionIndex: number;
  readonly actionType: string;
  readonly path?: ActionDiagnosticPath;
  readonly diagnostics: readonly GipActionDiagnostic[];

  constructor(diagnostics: readonly GipActionDiagnostic[]) {
    const first = diagnostics.find(
      diagnostic => diagnostic.severity === "error",
    );
    if (!first) throw new Error("GipActionError needs an error diagnostic");
    super(
      `Action ${first.actionIndex} (${first.actionType}) would fail: ${first.message}`,
      { metaMessages: [`Code: ${first.code}`] },
    );
    this.code = first.code;
    this.actionIndex = first.actionIndex;
    this.actionType = first.actionType;
    if (first.path) this.path = first.path;
    this.diagnostics = diagnostics;
  }
}
