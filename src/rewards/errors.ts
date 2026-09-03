import { BaseError } from "viem";
import type { ChainId } from "../model/index.js";

/**
 * Thrown when none of Merkl's domains answered for a chain.
 *
 * Everything a reader needs is in the message: this error travels to consumers
 * inside a chain's {@link ChainFailed} metadata, where it is typed `unknown`
 * and may be serialised by something that turns an arbitrary object into `{}`.
 */
export class MerklRequestFailedError extends BaseError {
  override name = "MerklRequestFailedError";

  public readonly chainId: ChainId;

  constructor(
    chainId: ChainId,
    path: string,
    attempts: ReadonlyArray<[domain: string, cause: unknown]>,
  ) {
    super(`Merkl could not be reached for chain ${chainId}.`, {
      // Only an `Error` can be a viem `cause`; the rest are spelled out below.
      cause: attempts.find(([, c]) => c instanceof Error)?.[1] as
        | Error
        | undefined,
      metaMessages: attempts.map(
        ([domain, cause]) => `${domain}${path} — ${describe(cause)}`,
      ),
    });
    this.chainId = chainId;
  }
}

function describe(cause: unknown): string {
  if (cause instanceof Error) {
    // `AbortSignal.timeout` rejects with a bare `TimeoutError`, whose message
    // says nothing about what timed out.
    return cause.name === "TimeoutError" ? "timed out" : cause.message;
  }
  return String(cause);
}
