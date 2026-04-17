import {
  type EIP1193RequestFn,
  type Hex,
  HttpRequestError,
  hexToNumber,
  InvalidParamsRpcError,
  numberToHex,
  type PublicRpcSchema,
  type Transport,
} from "viem";

/** Schema entry for `eth_getLogs` extracted from viem's {@link PublicRpcSchema}. */
type EthGetLogsSchema = Extract<
  PublicRpcSchema[number],
  { Method: "eth_getLogs" }
>;

/**
 * Filter parameter for `eth_getLogs` as defined by viem's {@link PublicRpcSchema}.
 * A discriminated union of block-range filters and block-hash filters.
 */
export type EthGetLogsFilter = EthGetLogsSchema["Parameters"][0];

/** Raw RPC return type for `eth_getLogs` (logs with hex-encoded quantities). */
export type EthGetLogsResult = EthGetLogsSchema["ReturnType"];

/**
 * Options controlling pagination behaviour of {@link logSplitterTransport}.
 */
export interface LogSplitterTransportOptions {
  /**
   * Acts as a min page size hint when there's no explit hint in rpc error message.
   * Has no effect once the page size is already below `softLimit`.
   */
  softLimit?: number;
  /**
   * Initial page size. The block range is walked in `hardLimit`-sized pages
   * from the start without attempting the full range first.
   */
  hardLimit?: number;
}

/**
 * @internal
 * Returns `true` when both `fromBlock` and `toBlock` are concrete hex-encoded
 * block numbers and `blockHash` is absent. Only fixed numeric ranges can be
 * split into sub-ranges for pagination.
 *
 * At the RPC transport level, block numbers are always `0x`-prefixed hex
 * strings, while named tags (`"latest"`, `"safe"`, etc.) are plain words.
 * The `0x` prefix check is sufficient to distinguish the two.
 *
 * @param filter - The `eth_getLogs` filter object.
 * @returns Whether the filter describes a fixed, splittable block range.
 */
export function isFixedBlockRange(filter: EthGetLogsFilter): boolean {
  if (filter.blockHash != null) return false;
  return isHexBlockNumber(filter.fromBlock) && isHexBlockNumber(filter.toBlock);
}

/**
 * @returns `true` when `value` is a hex-encoded block number (`0x`-prefixed
 * string), as opposed to a named {@link import("viem").BlockTag} or `undefined`.
 */
function isHexBlockNumber(value: unknown): value is Hex {
  return typeof value === "string" && value.startsWith("0x");
}

/**
 * Patterns that indicate the RPC rejected the request because the requested
 * block range or result set is too large. Collected from Alchemy, Infura,
 * Ankr, QuickNode, DRPC, and other popular providers.
 */
const RANGE_ERROR_PATTERNS: RegExp[] = [
  /block range/i,
  /too many results/i,
  /response size/i,
  /result window/i,
  /exceeds allowed/i,
  /cannot request logs over more than/i,
  /eth_getLogs is limited to/i,
  /eth_getLogs requests with up to/i,
  /range is too large/i,
  /exceeded max allowed range/i,
  // Encountered on DRPC: "query exceeds max results 20000, retry with the range …"
  /exceeds max results/i,
];

/**
 * Returns `true` when the error message matches known RPC range/size limit
 * patterns. Transient errors (timeouts, rate limits, 5xx) are explicitly
 * excluded — they should be retried by the underlying transport.
 *
 * @param error - Any thrown value.
 * @returns Whether the error indicates a block-range or result-size limit.
 */
export function isRangeError(error: unknown): boolean {
  const msg = errorMessage(error);
  return RANGE_ERROR_PATTERNS.some(re => re.test(msg));
}

/** Matches messages like `"cannot request logs over more than 500 blocks"`. */
const GENERIC_BLOCKS_RE = /(\d+)\s*block/i;

/**
 * Matches the Alchemy-specific suggested range inside a JSON `details` field:
 * `"this block range should work: [0x100, 0x1ff]"`.
 */
const ALCHEMY_RANGE_RE =
  /this block range should work: \[(0x[0-9a-fA-F]+),\s*(0x[0-9a-fA-F]+)\]/;

/**
 * Matches the DRPC-specific suggested range:
 * `"query exceeds max results 20000, retry with the range 19515507-19515513"`.
 */
const DRPC_RANGE_RE = /retry with the range (\d+)-(\d+)/;

/**
 * @internal
 * Attempts to extract a concrete page-size hint from an error thrown by an
 * RPC provider. Two strategies are tried:
 *
 * 1. **Alchemy JSON details** — parses the `details` field of a
 *    {@link HttpRequestError} for a suggested `[fromHex, toHex]` range and
 *    computes the span as `toHex - fromHex + 1`.
 * 2. **DRPC decimal range** — matches `retry with the range <from>-<to>` and
 *    computes the span as `to - from + 1`.
 * 3. **Generic N-blocks pattern** — matches `/<number> block(s)/i` in the
 *    error message.
 *
 * @param error - Any thrown value.
 * @returns The suggested page size, or `null` if no hint could be extracted.
 */
export function parsePageSizeHint(error: unknown): number | null {
  const alchemy = tryAlchemyHint(error);
  if (alchemy != null) return alchemy;

  const msg = errorMessage(error);

  const drpc = msg.match(DRPC_RANGE_RE);
  if (drpc) {
    const from = Number(drpc[1]);
    const to = Number(drpc[2]);
    return to - from + 1;
  }

  const m = msg.match(GENERIC_BLOCKS_RE);
  return m ? Number(m[1]) : null;
}

/**
 * Parses Alchemy's `HttpRequestError.details` JSON for a suggested block range.
 *
 * @returns The span (`toBlock - fromBlock + 1`), or `undefined` if not applicable.
 */
function tryAlchemyHint(error: unknown): number | undefined {
  if (!(error instanceof HttpRequestError)) return undefined;
  try {
    const parsed: { message?: string } = JSON.parse(error.details);
    if (typeof parsed.message !== "string") return undefined;
    const match = parsed.message.match(ALCHEMY_RANGE_RE);
    if (!match) return undefined;
    const from = hexToNumber(match[1] as Hex);
    const to = hexToNumber(match[2] as Hex);
    return to - from + 1;
  } catch {
    return undefined;
  }
}

/**
 * Extracts a plain-text message from an unknown thrown value, inspecting
 * both `message` and `details` (for viem `HttpRequestError`).
 */
function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    const details = (error as { details?: string }).details;
    return details ? `${error.message} ${details}` : error.message;
  }
  return String(error);
}

/**
 * @internal
 * Callback that performs a single `eth_getLogs` RPC call for the given
 * inclusive block range `[from, to]`.
 */
export type CallRpcFn = (from: number, to: number) => Promise<EthGetLogsResult>;

/**
 * @internal
 * Fetches logs over `[from, to]` using a sequential linear walk with
 * dynamically adjustable page size. On range errors the page is bisected
 * (optionally capped by {@link LogSplitterTransportOptions.softLimit | softLimit}).
 * Reduced page sizes persist for all subsequent pages in the same call.
 *
 * @param callRpc - Callback that performs a single `eth_getLogs` RPC call.
 * @param from    - Inclusive start block number.
 * @param to      - Inclusive end block number.
 * @param options - Optional pagination limits.
 * @returns All logs in the requested range, concatenated in order.
 *
 * @throws {@link InvalidParamsRpcError} when `from > to`.
 * @throws The original error when a single-block request fails or the error
 *         is not a recognised range error.
 */
export async function fetchLogsWithPagination(
  callRpc: CallRpcFn,
  from: number,
  to: number,
  options?: LogSplitterTransportOptions,
): Promise<EthGetLogsResult> {
  if (from > to) {
    throw new InvalidParamsRpcError(
      new Error(`Invalid parameters: from (${from}) > to (${to})`),
    );
  }

  const { softLimit, hardLimit } = options ?? {};
  let pageSize = hardLimit ?? to - from + 1;
  const results: EthGetLogsResult = [];
  let cursor = from;

  while (cursor <= to) {
    const chunkEnd = Math.min(to, cursor + pageSize - 1);
    try {
      const logs = await callRpc(cursor, chunkEnd);
      results.push(...logs);
      cursor = chunkEnd + 1;
    } catch (error) {
      if (!isRangeError(error)) {
        throw error;
      }
      if (cursor === chunkEnd) {
        throw error;
      }

      const hint = parsePageSizeHint(error);
      if (hint) {
        pageSize = hint;
      } else {
        const half = Math.max(1, Math.floor((chunkEnd - cursor + 1) / 2));
        pageSize = softLimit ? Math.min(softLimit, half) : half;
      }
    }
  }

  return results;
}

/**
 * Wraps a viem {@link Transport} to transparently split `eth_getLogs` requests
 * that exceed RPC provider block-range or result-size limits.
 *
 * Only requests with concrete numeric `fromBlock`/`toBlock` values (hex or
 * bigint) are intercepted. Calls using block tags (`"latest"`, `"earliest"`,
 * etc.) or `blockHash` are passed through unmodified.
 *
 * @param transport - The underlying viem transport to wrap.
 * @param options   - Optional pagination configuration.
 * @returns A new transport that performs automatic log pagination.
 *
 * @example
 * ```ts
 * import { createPublicClient, http } from "viem";
 * import { mainnet } from "viem/chains";
 * import { logSplitterTransport } from "./logSplitterTransport.js";
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: logSplitterTransport(http("https://rpc.example.com"), {
 *     hardLimit: 10_000,
 *     softLimit: 2_000,
 *   }),
 * });
 * ```
 */
export function logSplitterTransport(
  transport: Transport,
  logOptions?: LogSplitterTransportOptions,
): Transport {
  return opts => {
    const base = transport(opts);
    const rpcRequest = base.request as unknown as EIP1193RequestFn;

    const request = (async (args: never) => {
      const { method, params } = args as {
        method: string;
        params?: unknown[];
      };

      if (method !== "eth_getLogs") {
        return rpcRequest(args);
      }

      const filter = (params?.[0] ?? {}) as EthGetLogsFilter;
      if (!isFixedBlockRange(filter)) {
        return rpcRequest(args);
      }

      const from = hexToNumber(filter.fromBlock as Hex);
      const to = hexToNumber(filter.toBlock as Hex);

      const callRpc: CallRpcFn = async (f, t) => {
        const paginatedFilter = {
          ...filter,
          fromBlock: numberToHex(f),
          toBlock: numberToHex(t),
        };
        return rpcRequest({
          method: "eth_getLogs",
          params: [paginatedFilter],
        } as never) as Promise<EthGetLogsResult>;
      };

      return fetchLogsWithPagination(callRpc, from, to, logOptions);
    }) as unknown as EIP1193RequestFn;

    return { ...base, request };
  };
}
