import { z } from "zod/v4";
import { chainIdSchema, timestampSchema } from "./primitives.schema.js";
import type { DataResponse } from "./response.js";

/**
 * Runtime schemas for {@link ./response.js}, see the note in
 * `primitives.schema.ts` on why they are written by hand.
 *
 * `responseSchema(payloadSchema)` validates a successful backend 2xx body.
 * HTTP and transport errors never pass through it.
 **/

/**
 * {@link DataSource}
 **/
export const dataSourceSchema = z.enum(["onchain", "offchain"]);

/**
 * {@link ChainSucceeded}
 *
 * `source` may be omitted by the backend: everything it serves came from it, so
 * it is not asked to name itself. It decodes to `"offchain"` accordingly, which
 * is what keeps a decoded success from being a `ChainSucceeded` without one;
 * the offchain client then stamps every entry it decoded anyway.
 **/
export const chainSucceededSchema = z.object({
  chainId: chainIdSchema,
  status: z.literal("success"),
  source: dataSourceSchema.default("offchain"),
  blockNumber: z.number().int().nonnegative().optional(),
  timestamp: timestampSchema.optional(),
});

/**
 * {@link ChainFailed}
 *
 * `error` is a `string` in a JSON body. The schema accepts `unknown` so the
 * same codec also validates a locally produced envelope carrying an `Error`.
 **/
export const chainFailedSchema = z.object({
  chainId: chainIdSchema,
  status: z.literal("error"),
  source: dataSourceSchema.optional(),
  error: z.unknown().optional(),
});

/**
 * {@link ChainMetadata}
 **/
export const chainMetadataSchema = z.discriminatedUnion("status", [
  chainSucceededSchema,
  chainFailedSchema,
]);

/**
 * {@link ResponseMetadata}
 **/
export const responseMetadataSchema = z.object({
  chains: z.array(chainMetadataSchema),
});

/**
 * {@link DataResponse} parameterized by the payload schema.
 *
 * The result is declared rather than inferred: zod builds an object's output
 * through a mapped type, which does not reduce to `DataResponse<T>` while the
 * payload is still a type parameter, so a caller could not read `data` off the
 * parse result. The declaration is what this function exists to provide, and
 * the shape below is what upholds it.
 **/
export function responseSchema<S extends z.ZodType>(
  payloadSchema: S,
): z.ZodType<DataResponse<z.output<S>>> {
  return z.object({
    data: payloadSchema,
    meta: responseMetadataSchema,
  }) as unknown as z.ZodType<DataResponse<z.output<S>>>;
}
