import { z } from "zod";

import type { DataMeta, DataSource, ReadResult } from "./types.js";

export const dataSourceSchema = z.enum([
  "backend",
  "sdk",
]) satisfies z.ZodType<DataSource>;

/**
 * Strict on purpose: the envelope carries exactly one field, and an unexpected
 * key means the producer is talking about metadata no consumer honours.
 */
export const dataMetaSchema = z
  .object({
    source: dataSourceSchema,
  })
  .strict() satisfies z.ZodType<DataMeta>;

/**
 * Strict envelope around a tolerant payload: the backend may add payload fields
 * ahead of the client, but never envelope fields.
 */
export function readResultSchema<T>(
  dataSchema: z.ZodType<T>,
): z.ZodType<ReadResult<T>> {
  return z
    .object({
      data: dataSchema,
      meta: dataMetaSchema,
    })
    .strict();
}
