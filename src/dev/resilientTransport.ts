import type { EIP1193RequestFn, Transport } from "viem";
import { withRetry } from "viem";
import { z } from "zod/v4";

import { isOutOfSyncError } from "./isOutOfSyncError.js";
import { isRateLimitError } from "./isRateLimitError.js";
import { isTransientError } from "./isTransientError.js";

/** Schema for {@link RateLimitOptions}. */
export const rateLimitOptionsSchema = z.object({
  /**
   * Max retry attempts for rate-limit errors.
   * @default 3
   **/
  retryCount: z.number().int().min(0).default(3),
  /**
   * Upper bound (ms) for rate-limit delay, applied both to backoff and to
   * provider-supplied retry hints.
   * @default 5_000
   **/
  maxDelay: z.number().min(0).default(5_000),
});

/** Rate-limit retry settings accepted by `handleRateLimit`. */
export type RateLimitOptions = z.input<typeof rateLimitOptionsSchema>;

/** Schema for {@link ResilientTransportOptions}. */
export const resilientTransportOptionsSchema = z.object({
  /**
   * Max retry attempts.
   * @default 3
   **/
  retryCount: z.number().int().min(0).default(3),
  /**
   * Base delay (ms) for exponential backoff.
   * @default 300
   **/
  delay: z.number().min(0).default(300),
  /**
   * Upper bound (ms) for backoff delay.
   * @default 5_000
   **/
  maxDelay: z.number().min(0).default(5_000),
  /**
   * Max random jitter (ms) added to each delay.
   * @default 100
   **/
  jitter: z.number().min(0).default(100),
  /**
   * Retry on rate-limit (HTTP 429) errors. `false` disables, `true` uses
   * default {@link RateLimitOptions}, an object overrides them.
   * @default true
   **/
  handleRateLimit: z
    .union([z.boolean(), rateLimitOptionsSchema])
    .transform(v => (v === true ? rateLimitOptionsSchema.parse({}) : v))
    .prefault(true),
  /**
   * Retry on transient network/infrastructure errors.
   * @default true
   **/
  handleTransient: z.boolean().default(true),
  /**
   * Retry on out-of-sync / block-not-found errors.
   * @default true
   **/
  handleOutOfSync: z.boolean().default(true),
});

/** Options accepted by {@link resilientTransport}. */
export type ResilientTransportOptions = z.input<
  typeof resilientTransportOptionsSchema
>;

/**
 * Wraps a viem {@link Transport} with retry logic for rate-limit, transient,
 * and out-of-sync errors using exponential backoff + jitter.
 */
export function resilientTransport(
  underlyingTransport: Transport,
  options?: ResilientTransportOptions,
): Transport {
  const opts = resilientTransportOptionsSchema.parse(options ?? {});
  return transportOpts => {
    const base = underlyingTransport(transportOpts);
    const rpcRequest = base.request as unknown as EIP1193RequestFn;

    const rateLimit = opts.handleRateLimit;
    const retryCount = rateLimit
      ? Math.max(opts.retryCount, rateLimit.retryCount)
      : opts.retryCount;

    const request: EIP1193RequestFn = async args =>
      withRetry(() => rpcRequest(args as never) as Promise<unknown>, {
        retryCount,
        delay({ count, error }) {
          const jitter = Math.floor(Math.random() * opts.jitter);
          if (rateLimit) {
            const [isRate, retryAfterMs] = isRateLimitError(error);
            if (isRate) {
              const base = retryAfterMs ?? opts.delay * 2 ** count;
              return Math.min(rateLimit.maxDelay, base) + jitter;
            }
          }
          return Math.min(opts.maxDelay, opts.delay * 2 ** count) + jitter;
        },
        shouldRetry({ count, error }) {
          if (rateLimit && isRateLimitError(error)[0]) {
            return count < rateLimit.retryCount;
          }
          if (count >= opts.retryCount) {
            return false;
          }
          if (opts.handleTransient && isTransientError(error)) {
            return true;
          }
          if (opts.handleOutOfSync && isOutOfSyncError(error)) {
            return true;
          }
          return false;
        },
      }) as never;

    return { ...base, request };
  };
}
