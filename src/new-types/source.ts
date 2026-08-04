import { z } from "zod";

import { historySeriesListSchema } from "./history.js";
import {
  earnOpportunityListSchema,
  poolOpportunityDetailSchema,
  strategyOpportunityDetailSchema,
} from "./opportunities.js";
import { readResultSchema } from "./quality.js";
import type {
  Address,
  EarnDataSource,
  EarnOpportunityRow,
  HistorySeries,
  PoolOpportunityDetail,
  ReadResult,
  StrategyOpportunityDetail,
} from "./types.js";

/**
 * Response schemas. The facade parses each adapter response exactly once at the
 * boundary; components receive parsed types and never re-validate.
 */
export const opportunityListResultSchema = readResultSchema(
  earnOpportunityListSchema,
) satisfies z.ZodType<ReadResult<EarnOpportunityRow[]>>;

export const poolDetailResultSchema = readResultSchema(
  poolOpportunityDetailSchema,
) satisfies z.ZodType<ReadResult<PoolOpportunityDetail>>;

export const strategyDetailResultSchema = readResultSchema(
  strategyOpportunityDetailSchema,
) satisfies z.ZodType<ReadResult<StrategyOpportunityDetail>>;

export const historyResultSchema = readResultSchema(
  historySeriesListSchema,
) satisfies z.ZodType<ReadResult<HistorySeries[]>>;

interface EarnDataSourceFacadeOptions {
  backend: EarnDataSource;
  sdk: EarnDataSource;
}

/**
 * Internal marker: the response was well-formed, but broke a read-model
 * invariant the schemas cannot express. It never leaves this module — the
 * facade reports it as contract drift and falls back, exactly like a schema
 * failure.
 */
class ContractViolationError extends Error {}

type BackendFailureKind = "retry" | "contract-drift";

function classifyBackendFailure(error: unknown): BackendFailureKind {
  return error instanceof z.ZodError || error instanceof ContractViolationError
    ? "contract-drift"
    : "retry";
}

function logBackendFailure(method: keyof EarnDataSource, error: unknown): void {
  console.warn("Earn backend read failed; using the SDK source", {
    method,
    kind: classifyBackendFailure(error),
    error,
  });
}

/**
 * `walletEstimate` is owner-scoped, and preparing it is the adapter's job: it is
 * null exactly when the list was requested without an owner, and present for
 * every strategy when an owner was passed (an ineligible wallet is
 * `eligible: false`, not a missing estimate). Enforcing that here is what lets
 * the screen select over prepared estimates without ever computing one.
 */
function assertOwnerAwareEstimates(
  rows: EarnOpportunityRow[],
  owner: Address | undefined,
): void {
  for (const row of rows) {
    if (row.kind !== "strategy") continue;

    if (owner === undefined && row.walletEstimate !== null) {
      throw new ContractViolationError(
        `Strategy ${row.id} carries a wallet estimate for an ownerless list`,
      );
    }

    if (owner !== undefined && row.walletEstimate === null) {
      throw new ContractViolationError(
        `Strategy ${row.id} is missing the wallet estimate for ${owner}`,
      );
    }
  }
}

/**
 * Backend-first facade with whole-result SDK fallback.
 *
 * The backend is the primary source. On a thrown transport error or a schema
 * validation failure the SDK answers the *entire* root result — results are
 * never mixed field by field, so `meta.source` always names the source that
 * actually produced the data. Both adapters must prepare final, UI-ready values
 * (including the owner-aware `walletEstimate`), because React performs no
 * financial or protocol math.
 *
 * Failures of both sources throw; there is no ok/error envelope.
 * Each attempted root response is parsed once, so tolerant payload fields are
 * stripped while strict envelope drift triggers the next source.
 */
export function createEarnDataSource({
  backend,
  sdk,
}: EarnDataSourceFacadeOptions): EarnDataSource {
  async function withFallback<T>(
    method: keyof EarnDataSource,
    schema: z.ZodType<ReadResult<T>>,
    call: (source: EarnDataSource) => Promise<ReadResult<T>>,
    validate?: (data: T) => void,
  ): Promise<ReadResult<T>> {
    async function read(
      source: EarnDataSource,
      sourceName: "backend" | "sdk",
    ): Promise<ReadResult<T>> {
      const result = schema.parse(await call(source));
      validate?.(result.data);
      return { data: result.data, meta: { source: sourceName } };
    }

    try {
      return await read(backend, "backend");
    } catch (error) {
      logBackendFailure(method, error);
      return read(sdk, "sdk");
    }
  }

  return {
    listOpportunities: owner =>
      withFallback(
        "listOpportunities",
        opportunityListResultSchema,
        source => source.listOpportunities(owner),
        rows => assertOwnerAwareEstimates(rows, owner),
      ),
    getPool: id =>
      withFallback("getPool", poolDetailResultSchema, source =>
        source.getPool(id),
      ),
    getStrategy: id =>
      withFallback(
        "getStrategy",
        strategyDetailResultSchema,
        source => source.getStrategy(id),
        detail => assertOwnerAwareEstimates([detail], undefined),
      ),
    getHistory: (id, range, metrics) =>
      withFallback("getHistory", historyResultSchema, source =>
        source.getHistory(id, range, metrics),
      ),
  };
}
