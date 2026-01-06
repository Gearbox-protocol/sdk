import { z } from "zod/v4";

export const httpTransportOptionsSchema = z.object({
  /**
   * Whether to enable Batch JSON-RPC.
   * @link https://www.jsonrpc.org/specification#batch
   */
  batch: z
    .union([
      z.boolean(),
      z.object({
        /** The maximum number of JSON-RPC requests to send in a batch. @default 1_000 */
        batchSize: z.number().optional(),
        /** The maximum number of milliseconds to wait before sending a batch. @default 0 */
        wait: z.number().optional(),
      }),
    ])
    .optional(),
  /**
   * Request configuration to pass to `fetch`.
   * @link https://developer.mozilla.org/en-US/docs/Web/API/fetch
   */
  fetchOptions: z.record(z.string(), z.any()).optional(),
  /**
   * Methods to include or exclude from executing RPC requests.
   **/
  methods: z
    .union([
      z.object({
        include: z.array(z.string()).optional(),
      }),
      z.object({
        exclude: z.array(z.string()).optional(),
      }),
    ])
    .optional(),
  /**
   * The max number of times to retry.
   **/
  retryCount: z.number().optional(),
  /**
   * The base delay (in ms) between retries.
   **/
  retryDelay: z.number().optional(),
  /**
   * The timeout (in ms) for the HTTP request. Default: 10_000
   **/
  timeout: z.number().optional(),
});
