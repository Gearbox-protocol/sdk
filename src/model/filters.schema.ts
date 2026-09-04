import { z } from "zod/v4";
import type { Filterable } from "./filters.js";
import { FILTER_ALL, isFilterSet } from "./filters.js";

/**
 * Runtime schemas for {@link ./filters.js}, see the note in
 * `primitives.schema.ts` on why they are written by hand.
 **/

/**
 * {@link FilterAll}
 **/
export const filterAllSchema = z.literal(FILTER_ALL);

/**
 * {@link Filterable}
 **/
export function filterable<T extends z.ZodType>(
  schema: T,
): z.ZodUnion<[T, typeof filterAllSchema]> {
  return z.union([schema, filterAllSchema]);
}

export const booleanParamSchema = z.enum(["true", "false"]);

/**
 * A boolean condition as a URL can carry it: a condition that does not narrow
 * is absent rather than spelled out, see {@link booleanParamSchema}.
 **/
export function encodeFlag(
  condition: Filterable<boolean> | undefined,
): "true" | "false" | undefined {
  if (!isFilterSet(condition)) {
    return undefined;
  }
  return condition ? "true" : "false";
}
