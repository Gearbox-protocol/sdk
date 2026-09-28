import { BaseError, HttpRequestError } from "viem";

const RATE_LIMIT_PATTERNS: RegExp[] = [
  // Thirdweb (status 429): "You've been rate limited, please upgrade your plan."
  // Monad direct/Cloudflare (status 429): "You are being rate limited"
  /rate limit/i,
  // DRPC (code 15, status 429): "Too many request, try again later"
  // Ankr, Etherlink (status 429): nginx HTML "<title>429 Too Many Requests</title>"
  /too many request/i,
  // Alchemy (code 429, status 429): "Your app has exceeded its compute units per second capacity"
  /exceeded its compute units/i,
  // Providers embedding retry hints: "retry after 5 seconds", "retry in 10s"
  // Etherlink (code -32090, status 200): "Too many requests, reason: call rate limit exhausted, retry in 10s"
  /retry.{0,10}(in|after)\s+\d/i,
];

const RETRY_HINT_RE =
  /retry.{0,10}(?:in|after)\s+(\d+(?:\.\d+)?)\s*(ms|milliseconds?|s|secs?|seconds?|m|mins?|minutes?)?\b/i;

function extractRetryHint(msg: string): number | undefined {
  const match = msg.match(RETRY_HINT_RE);
  if (!match) {
    return undefined;
  }
  const value = Number(match[1]);
  const unit = match[2]?.toLowerCase() ?? "s";
  if (unit.startsWith("ms") || unit.startsWith("milli")) {
    return value;
  }
  if (unit.startsWith("m")) {
    return value * 60_000;
  }
  return value * 1000;
}

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
 * Whether the error indicates rate limiting. Returns `retryAfterMs` from the `Retry-After` header when available,
 * otherwise from a retry hint in the error message (e.g. "retry in 10s").
 */
export function isRateLimitError(
  e: Error,
): [checkResult: boolean, retryAfterMs?: number | undefined] {
  if (e instanceof BaseError) {
    let retryAfterMs: number | undefined;

    const httpMatch = e.walk(err => {
      if (err instanceof HttpRequestError && err.status === 429) {
        retryAfterMs =
          extractRetryAfter(err.headers) ?? extractRetryHint(err.details);
        return true;
      }
      return false;
    });
    if (httpMatch !== null) return [true, retryAfterMs];

    const msgMatch = e.walk(err => {
      const msg =
        (err as { details?: string }).details ?? (err as Error).message ?? "";
      if (RATE_LIMIT_PATTERNS.some(re => re.test(msg))) {
        retryAfterMs = extractRetryHint(msg);
        return true;
      }
      return false;
    });
    if (msgMatch !== null) return [true, retryAfterMs];
  }

  if (RATE_LIMIT_PATTERNS.some(re => re.test(e.message))) {
    return [true, extractRetryHint(e.message)];
  }
  return [false, undefined];
}
