import { TestnetsError } from "./TestnetsError.js";

/**
 * Thrown when a request to anvil-manager never completed: the network was
 * down, or it took longer than the client's timeout.
 **/
export class TestnetRequestFailedError extends TestnetsError {
  override name = "TestnetRequestFailedError";

  constructor(url: string, cause: unknown) {
    super(
      timedOut(cause)
        ? "The request to anvil-manager timed out."
        : "The request to anvil-manager failed.",
      { url, cause },
    );
  }
}

/**
 * Whether a caught value is the rejection `AbortSignal.timeout` produces.
 **/
function timedOut(error: unknown): boolean {
  return error instanceof Error && error.name === "TimeoutError";
}
