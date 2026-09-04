/**
 * The `cause` / `details` pair viem's `BaseError` accepts, see
 * {@link errorCause}.
 **/
export interface ErrorCause {
  /**
   * The caught value when it was an `Error`, so `walk()` reaches it.
   **/
  cause?: Error;
  /**
   * The caught value stringified, when it was not an `Error`.
   **/
  details?: string;
}

/**
 * Turns a caught `unknown` into what viem's `BaseError` takes: it types `cause`
 * as an `Error`, so anything else can only be reported as `details`.
 **/
export function errorCause(error: unknown): ErrorCause {
  if (error === undefined) {
    return {};
  }
  return error instanceof Error ? { cause: error } : { details: String(error) };
}
