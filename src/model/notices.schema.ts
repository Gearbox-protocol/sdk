import { z } from "zod/v4";
import { tokenSchema } from "./primitives.schema.js";

/**
 * {@link NoticeKind}
 **/
export const noticeKindSchema = z.union([
  z.literal("expired"),
  z.literal("externalRewards"),
  z.literal("extraApy"),
  z.literal("warning"),
  z.literal("disclaimer"),
]);

/**
 * {@link Notice}
 **/
export const noticeSchema = z.object({
  kind: noticeKindSchema,
  message: z.string(),
  token: tokenSchema.optional(),
});
