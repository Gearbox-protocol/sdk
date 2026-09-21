import type { AccountProjection } from "../../model/index.js";
import { type JourneyStep, JourneyUnavailable } from "./types.js";

interface PrepareError {
  code: string;
  message: string;
}

/** Only a genuinely missing route is unsupported; a market refusal remains a failure. */
const MISSING_ROUTE_CODES = new Set(["unsupportedTokenPair", "noDelayedRoute"]);

export function unavailable(error: PrepareError, label?: string): Error {
  const message = `${label ? `${label}: ` : ""}${error.code}: ${error.message}`;
  return MISSING_ROUTE_CODES.has(error.code)
    ? new JourneyUnavailable("unsupported", message, { cause: error })
    : new Error(message, { cause: error });
}

export function prepared<T>(
  result: { ok: true; data: T } | { ok: false; error: PrepareError },
): T {
  if (result.ok) return result.data;
  throw unavailable(result.error);
}

/** The outcome SDK preparation projected, later checked against the chain. */
export function projection(
  state: Pick<AccountProjection, "totalDebt" | "totalValue" | "leverage">,
): JourneyStep["expected"] {
  return {
    debt: state.totalDebt.value,
    value: state.totalValue.value,
    leverage: state.leverage,
  };
}
