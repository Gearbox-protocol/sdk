import {
  BaseError,
  type ContractFunctionParameters,
  ContractFunctionRevertedError,
} from "viem";

import type {
  PrerequisiteContext,
  PrerequisiteDetail,
  PrerequisiteError,
  PrerequisiteKind,
  PrerequisiteResult,
} from "./types.js";

/**
 * One entry of a viem `multicall({ allowFailure: true })` response: either a
 * decoded `result` or the `error` that the call reverted with.
 */
export type MulticallCallResult =
  | { status: "success"; result: unknown; error?: undefined }
  | { status: "failure"; result?: undefined; error: Error };

/**
 * Decodes an unknown error into a {@link PrerequisiteError} with a
 * human-readable revert reason. Mirrors the SDK's `extractCallError`: walk the
 * viem error chain for a {@link ContractFunctionRevertedError} and use its
 * `errorName`, otherwise fall back to the error's short message / name.
 */
export function toPrerequisiteError(cause: unknown): PrerequisiteError {
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
 * A single verifiable prerequisite for a transaction. Subclasses describe the
 * on-chain reads they need ({@link calls}) and how to turn the multicall slice
 * into a {@link PrerequisiteResult} ({@link resolve}).
 *
 * Identity (`id`, `kind`, `title`) and build-time `detail` are exposed as
 * read-only accessors; subclasses back them with private fields. The shared
 * {@link satisfiedResult}/{@link errorResult} helpers are `protected` so each
 * subclass builds results consistently.
 *
 * The same instance can be verified standalone via {@link verify} or batched
 * together with others by `verifyPrerequisites`.
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

  /** Contract reads this check needs (usually one). */
  public abstract calls(ctx: PrerequisiteContext): ContractFunctionParameters[];

  /** Maps this check's slice of the multicall response into a result. */
  public abstract resolve(slice: MulticallCallResult[]): PrerequisiteResult<K>;

  /**
   * Verifies this prerequisite on its own using an `allowFailure` multicall.
   * Prefer `verifyPrerequisites` to batch several checks into one round-trip.
   */
  public async verify(
    ctx: PrerequisiteContext,
  ): Promise<PrerequisiteResult<K>> {
    const calls = this.calls(ctx);
    const results = (await ctx.sdk.client.multicall({
      allowFailure: true,
      contracts: calls,
      // `undefined` lets viem read at `latest`; `blockNumber` is only set for
      // testnet forks pinned to a specific block.
      blockNumber: ctx.blockNumber,
    })) as unknown as MulticallCallResult[];
    return this.resolve(results);
  }

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

  /** Builds a failed result from a decoded read error. */
  protected errorResult(error: PrerequisiteError): PrerequisiteResult<K> {
    return {
      id: this.id,
      kind: this.kind,
      title: this.title,
      detail: this.detail,
      error,
    } as PrerequisiteResult<K>;
  }
}

/** Any prerequisite regardless of its kind, used for heterogeneous lists. */
export type AnyPrerequisite = Prerequisite<PrerequisiteKind>;
