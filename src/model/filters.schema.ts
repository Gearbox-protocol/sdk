import { z } from "zod/v4";
import { FILTER_ALL } from "./filters.js";

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
