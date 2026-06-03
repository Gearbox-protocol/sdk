import {
  BaseError,
  ContractFunctionRevertedError,
  decodeErrorResult,
  type Hex,
} from "viem";
import { errorAbis } from "../../abi/errors.js";

import type { SimulationError } from "./types.js";

/** Per-call slice of a `simulateCalls` failure we need to decode. */
export interface SimulationRevert {
  error?: Error;
  /** Raw revert return data, when present. */
  data?: Hex;
}

/**
 * Decodes a simulated transaction revert into a {@link SimulationError}.
 *
 * The simulated call is raw calldata (no ABI), so viem cannot decode the revert
 * itself. We first try to decode the raw return bytes against the SDK's
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
