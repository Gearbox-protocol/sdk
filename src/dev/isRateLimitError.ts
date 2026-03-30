import { BaseError, HttpRequestError } from "viem";

const RATE_LIMIT_PATTERNS: RegExp[] = [
  // Thirdweb (status 429): "You've been rate limited, please upgrade your plan."
  // Monad direct/Cloudflare (status 429): "You are being rate limited"
  /rate limit/i,
  // DRPC (code 15, status 429): "Too many request, try again later"
  // Ankr (status 429): HTML "<title>429 Too Many Requests</title>"
  /too many request/i,
  // Alchemy (code 429, status 429): "Your app has exceeded its compute units per second capacity"
  /exceeded its compute units/i,
  // Providers embedding retry hints: "retry after 5 seconds", "retry in 10s"
  /retry.{0,10}(in|after)\s+\d/i,
];

function extractRetryAfter(headers?: Headers): number | undefined {
  if (!headers) {
    return undefined;
  }
  const val = headers.get("retry-after");
  if (!val) {
    return undefined;
  }
  const seconds = Number(val);
  if (!Number.isNaN(seconds)) {
    return seconds * 1000;
  }
  const date = Date.parse(val);
  if (!Number.isNaN(date)) {
    return Math.max(0, date - Date.now());
  }
  return undefined;
}

/**
 * Whether the error indicates rate limiting. Returns `retryAfterMs` from the `Retry-After` header when available.
 */
export function isRateLimitError(
  e: Error,
): [checkResult: boolean, retryAfterMs?: number | undefined] {
  if (e instanceof BaseError) {
    let retryAfterMs: number | undefined;

    const httpMatch = e.walk(err => {
      if (err instanceof HttpRequestError && err.status === 429) {
        retryAfterMs = extractRetryAfter(err.headers);
        return true;
      }
      return false;
    });
    if (httpMatch !== null) return [true, retryAfterMs];

    const msgMatch = e.walk(err => {
      const msg =
        (err as { details?: string }).details ?? (err as Error).message ?? "";
      return RATE_LIMIT_PATTERNS.some(re => re.test(msg));
    });
    if (msgMatch !== null) return [true, undefined];
  }

  if (RATE_LIMIT_PATTERNS.some(re => re.test(e.message))) {
    return [true, undefined];
  }
  return [false, undefined];
}
