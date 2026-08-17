import { OffchainTransportError } from "./OffchainTransportError.js";

/**
 * Thrown when a request to the backend never completed: the network was down,
 * or it took longer than {@link GearboxAPIOptions.timeout}.
 **/
export class OffchainRequestFailedError extends OffchainTransportError {
  override name = "OffchainRequestFailedError";

  constructor(url: string, cause: unknown) {
    super(
      timedOut(cause)
        ? "The request to the Gearbox backend timed out."
        : "The request to the Gearbox backend failed.",
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
