import { BaseError, ContractFunctionRevertedError } from "viem";

import type {
  PrerequisiteContext,
  PrerequisiteDetail,
  PrerequisiteError,
  PrerequisiteKind,
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
 *
 */
export abstract class Prerequisite<K extends PrerequisiteKind> {
  /** Stable identifier, used as a React key and for deduplication. */
  public abstract get id(): string;
  /** Discriminant tying this check to its detail payload. */
  public abstract get kind(): K;
  /** Human-readable label shown in the UI. */
  public abstract get title(): string;
  /** Inputs known before reading the chain (no `actual` yet). */
  public abstract get detail(): PrerequisiteDetail<K>;

  /**
   * Verifies this prerequisite. Never rejects: any error thrown by
   * {@link check} (revert, RPC/network failure, compressor error) is
   * normalized into an `error` result.
   */
  public async verify(
    ctx: PrerequisiteContext,
  ): Promise<PrerequisiteResult<K>> {
    try {
      return await this.check(ctx);
    } catch (cause) {
      return this.errorResult(cause);
    }
  }

  /**
   * Performs the reads this prerequisite needs and maps them into a result.
   * May throw on read failure; {@link verify} converts throws into `error`
   * results.
   */
  protected abstract check(
    ctx: PrerequisiteContext,
  ): Promise<PrerequisiteResult<K>>;

  /** Builds a successful result; `detail` carries the on-chain `actual`. */
  protected satisfiedResult(
    satisfied: boolean,
    detail: PrerequisiteDetail<K>,
  ): PrerequisiteResult<K> {
    return {
      id: this.id,
      kind: this.kind,
      title: this.title,
      detail,
      satisfied,
    } as PrerequisiteResult<K>;
  }

  /** Builds a failed result from a raw read error (normalized internally). */
  protected errorResult(cause: unknown): PrerequisiteResult<K> {
    return {
      id: this.id,
      kind: this.kind,
      title: this.title,
      detail: this.detail,
      error: toPrerequisiteError(cause),
    } as PrerequisiteResult<K>;
  }
}

/** Any prerequisite regardless of its kind, used for heterogeneous lists. */
export type AnyPrerequisite = Prerequisite<PrerequisiteKind>;
