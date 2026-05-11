import { BaseError, HttpRequestError, TimeoutError } from "viem";

const TRANSIENT_HTTP_STATUSES = new Set([502, 503, 504]);

const TRANSIENT_PATTERNS: RegExp[] = [
  // viem TimeoutError: RPC endpoint didn't respond within configured timeout
  // (default 10s). details = "The request timed out."
  /timed?\s*out/i,
  // Node.js ECONNRESET: TCP connection forcibly closed by the server mid-request,
  // typically during server restarts or under heavy load.
  // Wrapped by viem in HttpRequestError with cause TypeError("fetch failed")
  /econnreset/i,
  // Node.js "socket hang up": server closed the TCP connection before sending
  // a complete response, similar to ECONNRESET but at HTTP level
  /socket hang up/i,
  // Browser/Node.js fetch failures: DNS resolution failure, connection refused,
  // unreachable host, or CORS errors. Wrapped in HttpRequestError by viem.
  /network error|failed to fetch|fetch failed/i,
  // HTTP 503 text in response body when status check alone doesn't catch it
  // (e.g., HTML error page from a CDN/proxy during maintenance or overload)
  /service unavailable/i,
  // HTTP 502 text in response body from load balancer/reverse proxy when the
  // backend RPC node is unreachable or returned an invalid response
  /bad gateway/i,
  // HTTP 504 text in response body from gateway/proxy when the upstream RPC
  // node didn't respond in time
  /gateway time/i,
  // Malformed JSON-RPC response: server returned 200 with empty/null body or
  // non-JSON content despite application/json content-type, causing viem's
  // response parser to fail with a destructuring TypeError
  /cannot destructure/i,
  // viem UnknownRpcError: provider returned a JSON-RPC error with an
  // unrecognized error code that viem can't categorize.
  // shortMessage = "An unknown RPC error occurred."
  /unknown rpc error/i,
  // EIP-1474 ResourceUnavailableRpcError (code -32002): node is syncing or the
  // requested resource is temporarily unavailable.
  // Matches both the RPC message and viem's shortMessage "Requested resource not available."
  /resource unavailable|requested resource not available/i,
  // sometimes happens on DRPC: "GRPC Context cancellation"
  /context cancel/i,
  // DRPC error: Can't route your request to suitable provider, if you specified certain providers revise the list
  /suitable provider/i,
  // DRPC error: Temporary internal error. Please retry, trace-id: xxx
  /temporary internal error/i,
];

/**
 * Whether the error indicates a transient, retryable failure (timeouts, connection issues, 5xx, etc.).
 */
export function isTransientError(e: Error): boolean {
  if (e instanceof BaseError) {
    // Structural check: viem TimeoutError when request exceeds configured timeout
    if (e instanceof TimeoutError) return true;

    // Structural check: HTTP 502/503/504 from load balancer or proxy in front of RPC node
    const httpMatch = e.walk(err => {
      if (
        err instanceof HttpRequestError &&
        err.status !== undefined &&
        TRANSIENT_HTTP_STATUSES.has(err.status)
      ) {
        return true;
      }
      return false;
    });
    if (httpMatch !== null) return true;

    // Pattern matching on details/message through the error chain
    const msgMatch = e.walk(err => {
      const msg =
        (err as { details?: string }).details ?? (err as Error).message ?? "";
      return TRANSIENT_PATTERNS.some(re => re.test(msg));
    });
    return msgMatch !== null;
  }
  return TRANSIENT_PATTERNS.some(re => re.test(e.message));
}
