import { OffchainStatusError } from "./OffchainStatusError.js";

/** A signer refused the HTTP request. Retry-After is measured in seconds. */
export class OpeningSignerError extends OffchainStatusError {
  override name = "OpeningSignerError";

  static fromStatus(
    url: string,
    status: number,
    body: string | undefined,
    retryAfterSeconds?: number,
  ): OpeningSignerError {
    if (status === 451)
      return new OpeningSignerDeniedError(url, status, body, retryAfterSeconds);
    if (status === 429 || status === 503)
      return new OpeningSignerRetryableError(
        url,
        status,
        body,
        retryAfterSeconds,
      );
    if (status >= 400 && status < 500)
      return new OpeningSignerRequestError(
        url,
        status,
        body,
        retryAfterSeconds,
      );
    return new OpeningSignerServiceError(url, status, body, retryAfterSeconds);
  }

  constructor(
    url: string,
    status: number,
    body: string | undefined,
    public readonly retryAfterSeconds?: number,
  ) {
    super(url, status, body);
  }
}

/** The signer denied the owner during screening (451). */
export class OpeningSignerDeniedError extends OpeningSignerError {
  override name = "OpeningSignerDeniedError";
}

/** Rate limiting (429) or temporary unavailability (503). */
export class OpeningSignerRetryableError extends OpeningSignerError {
  override name = "OpeningSignerRetryableError";
}

/** The endpoint rejected the request, for example malformed input or an unsupported market. */
export class OpeningSignerRequestError extends OpeningSignerError {
  override name = "OpeningSignerRequestError";
}

/** An unexpected HTTP response from the signer or its gateway. */
export class OpeningSignerServiceError extends OpeningSignerError {
  override name = "OpeningSignerServiceError";
}
