import type { z } from "zod/v4";
import type { Amount, TokenAmount } from "./primitives.js";

/**
 * How close two numeric values may be before a disagreement counts as real.
 *
 * The compare scripts pick a formula from this union; the schemas only name
 * which formula a field uses.
 *
 * - `"amount"` — accrual lag on an {@link Amount.value} / {@link TokenAmount.value}.
 * - `"bps"` — truncation vs rounding on a basis-point rate, ±1.
 * - `"float"` — relative float drift within 0.1% (leverage).
 * - `"usd"` — price-derived {@link Amount.valueUsd} / {@link TokenAmount.valueUsd}.
 **/
export type CompareTolerance = "amount" | "bps" | "float" | "usd";

/**
 * A numeric field whose two sources may drift within {@link tolerance}.
 **/
export interface ToleranceCompareTag {
  tolerance: CompareTolerance;
}

/**
 * Compare metadata a schema field may carry.
 *
 * - `"offchainOnly"` / `"onchainOnly"` — the other source typically leaves
 *   the field empty, so a disagreement is expected.
 * - `"backendPreferred"` — both sources fill the field, but both-mode merge
 *   overlays the backend value, so a disagreement is expected.
 * - {@link ToleranceCompareTag} — a numeric disagreement within the named
 *   formula is expected snapshot noise.
 **/
export type CompareTag =
  | "offchainOnly"
  | "onchainOnly"
  | "backendPreferred"
  | ToleranceCompareTag;

/**
 * Marks a field that only the backend fills.
 **/
export function offchainOnly<S extends z.ZodType>(schema: S): S {
  return schema.meta({ compare: "offchainOnly" satisfies CompareTag });
}

/**
 * Marks a field that only the chain fills.
 **/
export function onchainOnly<S extends z.ZodType>(schema: S): S {
  return schema.meta({ compare: "onchainOnly" satisfies CompareTag });
}

/**
 * Marks a field whose backend value both-mode merge overlays onto the chain
 * row, so a source disagreement is expected.
 **/
export function backendPreferred<S extends z.ZodType>(schema: S): S {
  return schema.meta({ compare: "backendPreferred" satisfies CompareTag });
}

/**
 * Marks a numeric field whose two sources may drift within {@link kind}.
 **/
export function tolerance<S extends z.ZodType>(
  schema: S,
  kind: CompareTolerance,
): S {
  return schema.meta({ compare: { tolerance: kind } satisfies CompareTag });
}

/**
 * The compare tag registered on a schema, if any.
 **/
export function compareTagOf(schema: z.ZodType): CompareTag | undefined {
  const meta = schema.meta();
  if (!meta || !("compare" in meta)) {
    return undefined;
  }
  return meta.compare as CompareTag;
}
