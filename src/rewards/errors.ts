import { BaseError } from "viem";
import type { ChainId } from "../model/index.js";

/**
 * Thrown when Merkl did not answer for a chain.
 *
 * Everything a reader needs is in the message: this error travels to consumers
 * inside a chain's {@link ChainFailed} metadata, where it is typed `unknown`
 * and may be serialised by something that turns an arbitrary object into `{}`.
 */
export class MerklRequestFailedError extends BaseError {
  override name = "MerklRequestFailedError";

  public readonly chainId: ChainId;

  constructor(chainId: ChainId, path: string, cause: unknown) {
    super(`Merkl could not be reached for chain ${chainId}.`, {
      cause: cause instanceof Error ? cause : undefined,
      metaMessages: [`${path} — ${describe(cause)}`],
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

/** Turtle answers for every chain at once, so this names no chain. */
export class TurtleRequestFailedError extends BaseError {
  override name = "TurtleRequestFailedError";

  constructor(path: string, cause: unknown) {
    super("Turtle could not be reached.", {
      cause: cause instanceof Error ? cause : undefined,
      metaMessages: [`${path} — ${describe(cause)}`],
    });
  }
}
