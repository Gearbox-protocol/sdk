import { z } from "zod/v4";
import { chainIdSchema, timestampSchema } from "./primitives.schema.js";

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
export const dataSourceSchema = z.union([
  z.literal("onchain"),
  z.literal("offchain"),
]);

/**
 * {@link ChainSucceeded}
 **/
export const chainSucceededSchema = z.object({
  chainId: chainIdSchema,
  status: z.literal("success"),
  source: dataSourceSchema,
  blockNumber: z.number().int().nonnegative().optional(),
  timestamp: timestampSchema.optional(),
});

/**
 * {@link ChainFailed}
 *
 * `error` is a `string` on the wire. The schema accepts `unknown` so the same
 * codec also validates a locally produced envelope that carries an `Error`.
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
export function responseSchema<S extends z.ZodType>(payloadSchema: S) {
  return z.object({
    data: payloadSchema,
    meta: responseMetadataSchema,
  });
}
