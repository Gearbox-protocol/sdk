import type { ChainId, DataSource, Timestamp } from "../../model/index.js";
import {
  OffchainInvalidJsonError,
  OffchainRequestFailedError,
  OffchainStatusError,
  OffchainValidationError,
} from "../../offchain/index.js";
import { chains } from "../../onchain/index.js";
import { DEFAULT_MAX_OFFCHAIN_LAG } from "../utils/mergeChains.js";

/**
 * Chains every fallback fixture covers: A stays healthy in the per-chain
 * scenario, B is the one the backend reports as failed.
 **/
export const TEST_CHAIN_A = chains.Mainnet.id as ChainId;
export const TEST_CHAIN_B = chains.Plasma.id as ChainId;

/**
 * Shared block/time of a healthy answer. On-chain stubs use this so a fresh
 * backend response wins and a timestamp older than {@link TEST_STALE_TIMESTAMP}
 * loses.
 **/
export const TEST_NOW = 1_700_000_000 as Timestamp;
export const TEST_BLOCK = 100;

/**
 * How long the GearboxAPI under test waits before aborting. Short so the
 * timeout scenario finishes on a real timer without racing: the fetch mock
 * never resolves on its own.
 **/
export const OFFCHAIN_TIMEOUT_MS = 5;

/**
 * Timestamp that is one second past {@link DEFAULT_MAX_OFFCHAIN_LAG} behind
 * {@link TEST_NOW}, so freshness prefers the chain.
 **/
export const TEST_STALE_TIMESTAMP = (TEST_NOW -
  DEFAULT_MAX_OFFCHAIN_LAG -
  1) as Timestamp;

/**
 * Constructor of the error the offchain client raises for a transport failure.
 **/
export type OffchainErrorConstructor =
  | typeof OffchainRequestFailedError
  | typeof OffchainStatusError
  | typeof OffchainInvalidJsonError
  | typeof OffchainValidationError;

/**
 * One way the whole offchain leg throws, so every chain must come from the
 * chain.
 **/
export interface TransportFailureScenario {
  name: string;
  fetchImpl: typeof fetch;
  expectedError: OffchainErrorConstructor;
}

/**
 * Shape of a backend 2xx body, before the client stamps `source`.
 **/
export interface OffchainEnvelope {
  data: unknown;
  meta: { chains: OffchainChainMeta[] };
}

/**
 * One chain entry in a backend envelope.
 **/
export interface OffchainChainMeta {
  chainId: number;
  status: "success" | "error";
  source?: DataSource;
  blockNumber?: number;
  timestamp?: number;
  error?: unknown;
}

/**
 * One way the backend answered HTTP 200 with a usable envelope, but the merge
 * should not take every chain from it.
 **/
export interface DegradedResponseScenario {
  name: string;
  makeBody: (healthyPayload: unknown) => OffchainEnvelope;
  expectedSources: Record<number, DataSource>;
}

/**
 * Builds a JSON `Response` the fetch mock can return.
 **/
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/**
 * Success metadata as the backend sends it: `source` is omitted and stamped
 * by the client.
 **/
export function offchainSuccess(chainId: ChainId): OffchainChainMeta {
  return {
    chainId,
    status: "success",
    blockNumber: TEST_BLOCK,
    timestamp: TEST_NOW,
  };
}

/**
 * Transport and protocol failures: the request never becomes a
 * {@link import("../../model/index.js").DataResponse}.
 **/
export const TRANSPORT_FAILURES: TransportFailureScenario[] = [
  {
    name: "the network request fails",
    fetchImpl: async () => {
      throw new TypeError("fetch failed");
    },
    expectedError: OffchainRequestFailedError,
  },
  {
    name: "the request times out",
    fetchImpl: rejectWhenAborted,
    expectedError: OffchainRequestFailedError,
  },
  {
    name: "the backend answers 404",
    fetchImpl: async () => jsonResponse({ error: "not found" }, 404),
    expectedError: OffchainStatusError,
  },
  {
    name: "the backend answers 503 with an HTML gateway page",
    fetchImpl: async () =>
      new Response("<html>Service Unavailable</html>", {
        status: 503,
        headers: { "content-type": "text/html" },
      }),
    expectedError: OffchainStatusError,
  },
  {
    name: "the backend answers 200 with HTML",
    fetchImpl: async () =>
      new Response("<html>ok</html>", {
        status: 200,
        headers: { "content-type": "text/html" },
      }),
    expectedError: OffchainInvalidJsonError,
  },
  {
    name: "the backend answers valid JSON that does not match the read model",
    fetchImpl: async () => jsonResponse({ data: null }),
    expectedError: OffchainValidationError,
  },
  {
    name: "the backend answers truncated JSON",
    fetchImpl: async () =>
      new Response('{"data":[', {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    expectedError: OffchainInvalidJsonError,
  },
];

/**
 * HTTP-success envelopes that the merge layer must not take wholesale.
 **/
export const DEGRADED_RESPONSES: DegradedResponseScenario[] = [
  {
    name: "the backend marks one chain as failed",
    makeBody: healthy => {
      const envelope = requireEnvelope(healthy);
      return {
        data: envelope.data,
        meta: {
          chains: envelope.meta.chains.map(chain =>
            chain.chainId === TEST_CHAIN_B
              ? {
                  chainId: TEST_CHAIN_B,
                  status: "error" as const,
                  error: "backend failed this chain",
                }
              : chain,
          ),
        },
      };
    },
    expectedSources: {
      [TEST_CHAIN_A]: "offchain",
      [TEST_CHAIN_B]: "onchain",
    },
  },
  {
    name: "the backend data is stale",
    makeBody: healthy => {
      const envelope = requireEnvelope(healthy);
      return {
        data: envelope.data,
        meta: {
          chains: envelope.meta.chains.map(chain =>
            chain.status === "success"
              ? { ...chain, timestamp: TEST_STALE_TIMESTAMP }
              : chain,
          ),
        },
      };
    },
    expectedSources: {
      [TEST_CHAIN_A]: "onchain",
      [TEST_CHAIN_B]: "onchain",
    },
  },
];

/**
 * Fetch stand-in that cannot win the race against {@link AbortSignal.timeout}:
 * it only rejects once the signal the client attached fires.
 **/
function rejectWhenAborted(
  _input: Parameters<typeof fetch>[0],
  init?: RequestInit,
): Promise<Response> {
  const signal = init?.signal;
  return new Promise((_resolve, reject) => {
    if (signal == null) {
      throw new Error("timeout scenario expected AbortSignal on fetch");
    }
    const abort = (): void => {
      reject(
        signal.reason ??
          new DOMException("The operation was aborted.", "TimeoutError"),
      );
    };
    if (signal.aborted) {
      abort();
      return;
    }
    signal.addEventListener("abort", abort, { once: true });
  });
}

/**
 * Narrows a method's healthy payload to the envelope `makeBody` rewrites.
 **/
function requireEnvelope(payload: unknown): OffchainEnvelope {
  if (!isOffchainEnvelope(payload)) {
    throw new Error(
      "healthy offchain payload must be a { data, meta } envelope",
    );
  }
  return payload;
}

function isOffchainEnvelope(payload: unknown): payload is OffchainEnvelope {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "data" in payload &&
    "meta" in payload
  );
}
