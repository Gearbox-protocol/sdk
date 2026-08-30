import {
  BaseError,
  ContractFunctionRevertedError,
  decodeErrorResult,
  type Hex,
} from "viem";
import { errorAbis } from "../../abi/errors.js";
import type { IGearboxError } from "../../model/index.js";

/** Which simulation flow produced a failure. */
export type SimulationFlowSource = "multicall" | "unknown";

/** A single flow failure with its decoded revert detail. */
export interface SimulationFlowFailure {
  source: SimulationFlowSource;
  detail: SimulationError;
}

/**
 * Refusal answered when the pool simulation fails. It wraps each flow's
 * decoded revert reason (see {@link failures}). A plain returned object per
 * the SDK's refusal vocabulary — not a thrown `Error`.
 */
export interface PreviewSimulationError extends IGearboxError {
  code: "previewSimulationFailed";
  /** Per-flow decoded failures behind this refusal. */
  failures: SimulationFlowFailure[];
  /** First flow failure that was itself an `Error`, kept for debugging. */
  cause?: Error;
}

function isPreviewSimulationError(
  value: unknown,
): value is PreviewSimulationError {
  return (
    typeof value === "object" &&
    value !== null &&
    !(value instanceof Error) &&
    (value as PreviewSimulationError).code === "previewSimulationFailed"
  );
}

/**
 * Normalises an unknown rejection reason into a {@link PreviewSimulationError}.
 * Pass-through when it already is one; otherwise decodes it under `source`.
 */
export function asPreviewSimulationError(
  reason: unknown,
  source: SimulationFlowSource,
): PreviewSimulationError {
  if (isPreviewSimulationError(reason)) {
    return reason;
  }
  const error = reason instanceof Error ? reason : new Error(String(reason));
  const detail = decodeSimulationError({ error });
  return {
    code: "previewSimulationFailed",
    message: detail.reason,
    failures: [{ source, detail }],
    cause: error,
  };
}

/** Decoded revert of the simulated transaction. */
export interface SimulationError {
  /** Human-readable revert reason / error name. */
  reason: string;
  /** Original error, kept for debugging. */
  cause?: unknown;
}

/** Per-call slice of a multicall failure we need to decode. */
export interface SimulationRevert {
  error?: Error;
  /** Raw revert return data, when present. */
  data?: Hex;
}

/**
 * Decodes a simulated call revert into a {@link SimulationError}.
 *
 * We first try to decode any raw return bytes against the SDK's
 * {@link errorAbis} (Gearbox protocol exceptions plus standard ERC-20 custom
 * errors); failing that, we walk viem's error chain for a
 * {@link ContractFunctionRevertedError} (covers `Error(string)` / `Panic`).
 */
export function decodeSimulationError(
  revert: SimulationRevert,
): SimulationError {
  const { error, data } = revert;

  if (data && data !== "0x") {
    try {
      const decoded = decodeErrorResult({ abi: errorAbis, data });
      return {
        reason: formatDecodedError(decoded.errorName, decoded.args),
        cause: error,
      };
    } catch {
      // Not a known custom error; fall back to the viem error chain below.
    }
  }

  if (error instanceof BaseError) {
    const reverted = error.walk(
      e => e instanceof ContractFunctionRevertedError,
    );
    if (reverted instanceof ContractFunctionRevertedError) {
      return {
        reason:
          reverted.data?.errorName ??
          reverted.reason ??
          reverted.shortMessage ??
          "reverted",
        cause: error,
      };
    }
    return { reason: error.shortMessage ?? error.name, cause: error };
  }

  if (error instanceof Error) {
    return { reason: error.message, cause: error };
  }

  return { reason: "reverted", cause: error };
}

/** Renders `Name` or `Name(arg0, arg1)` for a decoded custom error. */
function formatDecodedError(
  errorName: string,
  args: readonly unknown[] | undefined,
): string {
  if (!args || args.length === 0) {
    return errorName;
  }
  return `${errorName}(${args.map(arg => String(arg)).join(", ")})`;
}
