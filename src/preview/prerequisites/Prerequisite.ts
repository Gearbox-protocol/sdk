import { BaseError, ContractFunctionRevertedError } from "viem";

import type {
  PrerequisiteContext,
  PrerequisiteError,
  PrerequisiteResult,
} from "./types.js";

/**
 * Decodes an unknown error into a {@link PrerequisiteError} with a
 * human-readable revert reason. Mirrors the SDK's `extractCallError`: walk the
 * viem error chain for a {@link ContractFunctionRevertedError} and use its
 * `errorName`, otherwise fall back to the error's short message / name.
 */
function toPrerequisiteError(cause: unknown): PrerequisiteError {
  if (cause instanceof BaseError) {
    const reverted = cause.walk(
      e => e instanceof ContractFunctionRevertedError,
    );
    if (reverted instanceof ContractFunctionRevertedError) {
      return {
        reason: reverted.data?.errorName ?? reverted.shortMessage ?? "reverted",
        cause,
      };
    }
    return { reason: cause.shortMessage ?? cause.name, cause };
  }
  if (cause instanceof Error) {
    return { reason: cause.message, cause };
  }
  return { reason: "unknown error", cause };
}

/**
 * A single verifiable prerequisite for a transaction. Subclasses implement
 * {@link check} to perform whatever async reads they need (an ERC-20
 * `readContract`, a compressor call, ...) and map the outcome into a
 * {@link PrerequisiteResult}.
 */
export abstract class Prerequisite {
  /**
   * Verifies this prerequisite. Never rejects: any error thrown by
   * {@link check} (revert, RPC/network failure, compressor error) is
   * normalized into an `error` result.
   */
  public async verify(ctx: PrerequisiteContext): Promise<PrerequisiteResult> {
    try {
      return await this.check(ctx);
    } catch (cause) {
      return this.errorResult(toPrerequisiteError(cause));
    }
  }

  /**
   * Performs the reads this prerequisite needs and maps them into a result.
   * May throw on read failure; {@link verify} converts throws into `error`
   * results.
   */
  protected abstract check(
    ctx: PrerequisiteContext,
  ): Promise<PrerequisiteResult>;

  /** Builds this prerequisite's failed result from a normalized read error. */
  protected abstract errorResult(error: PrerequisiteError): PrerequisiteResult;
}
