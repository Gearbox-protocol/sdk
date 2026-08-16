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
 * `source` may be omitted by the backend and decodes to `"offchain"`. The block
 * has no such default: a success that omits it fails validation.
 **/
export const chainSucceededSchema = z.object({
  chainId: chainIdSchema,
  status: z.literal("success"),
  source: dataSourceSchema.default("offchain"),
  blockNumber: z.number().int().nonnegative(),
  timestamp: timestampSchema,
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
 **/
export function responseSchema<S extends z.ZodType>(
  payloadSchema: S,
): z.ZodType<DataResponse<z.output<S>>> {
  // zod infers the output through a mapped type, which does not reduce to
  // `DataResponse<T>` while the payload is still a type parameter
  return z.object({
    data: payloadSchema,
    meta: responseMetadataSchema,
  }) as unknown as z.ZodType<DataResponse<z.output<S>>>;
}
