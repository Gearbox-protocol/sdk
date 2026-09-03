import type { OperationCheckError } from "./checks/index.js";
import type { PreviewIssue } from "./refusal.js";

/**
 * A check's error in the `{ reason, detail }` shape the engine result and
 * `prepare` still speak.
 *
 * Transitional: the two vocabularies exist side by side only until the engine
 * and the namespaces carry error objects end to end, at which point this and
 * {@link PreviewIssue} go together. Nothing new should be written against it.
 *
 * Two codes have no `reason` of their own: the paused pair collapses back into
 * `marketPaused`, and a short balance into `insufficientSourceBalance`.
 **/
export function toIssue(error: OperationCheckError): PreviewIssue {
  switch (error.code) {
    case "creditManagerPaused":
      return {
        reason: "marketPaused",
        detail: { creditManager: error.creditManager },
      };
    case "poolPaused":
      return { reason: "marketPaused", detail: { pool: error.pool } };
    case "marketExpired":
      return {
        reason: "marketExpired",
        detail: {
          creditManager: error.creditManager,
          expirationDate: error.expirationDate,
        },
      };
    case "poolSunset":
      return { reason: "poolSunset", detail: { pool: error.pool } };
    case "insufficientPoolLiquidity":
      return {
        reason: "insufficientPoolLiquidity",
        detail: {
          requested: error.requested,
          available: error.available,
          limit: error.limit,
          ...(error.maxBorrowAmount === undefined
            ? {}
            : { maxBorrowAmount: error.maxBorrowAmount }),
        },
      };
    case "debtOutOfRange":
      return {
        reason: "debtOutOfRange",
        detail: {
          requested: error.requested,
          minDebt: error.minDebt,
          maxDebt: error.maxDebt,
        },
      };
    case "leverageOutOfRange":
      return {
        reason: "leverageOutOfRange",
        detail:
          error.requested === undefined || error.min === undefined
            ? undefined
            : { requested: error.requested, min: error.min },
      };
    case "insufficientCollateral":
      return {
        reason: "insufficientCollateral",
        detail: {
          healthFactor: error.healthFactor,
          healthFactorThreshold: error.healthFactorThreshold,
          safePrices: error.safePrices,
        },
      };
    case "forbiddenToken":
      return { reason: "forbiddenToken", detail: { token: error.token } };
    case "quotaLimitReached":
      return {
        reason: "quotaLimitReached",
        detail: {
          token: error.token,
          requested: error.requested,
          available: error.available,
        },
      };
    case "quotaCountExceeded":
      return {
        reason: "quotaCountExceeded",
        detail: { count: error.count, max: error.max },
      };
    case "insufficientBalance":
      return {
        reason: "insufficientSourceBalance",
        detail:
          error.required === undefined || error.held === undefined
            ? undefined
            : { required: error.required, held: error.held },
      };
    case "malformedTransaction":
      return { reason: "malformedTransaction", detail: error.warning };
  }
}

/** The first error of a check bundle as an issue, or `null` when it passed. */
export function firstIssue(
  errors: readonly OperationCheckError[],
): PreviewIssue | null {
  const [first] = errors;
  return first ? toIssue(first) : null;
}
