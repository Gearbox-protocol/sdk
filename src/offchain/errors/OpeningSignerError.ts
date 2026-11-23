import { OffchainStatusError } from "./OffchainStatusError.js";

/** A signer refused the HTTP request. Retry-After is measured in seconds. */
export class OpeningSignerError extends OffchainStatusError {
  override name = "OpeningSignerError";

  constructor(
    url: string,
    status: number,
    body: string | undefined,
    public readonly retryAfterSeconds?: number,
  ) {
    super(url, status, body);
  }
}
