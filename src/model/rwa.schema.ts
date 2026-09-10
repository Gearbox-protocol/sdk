import { z } from "zod/v4";
import { tokenSchema } from "./primitives.schema.js";
import { RWA_PROTOCOLS } from "./rwa.js";

/**
 * {@link ./rwa.js#RWAProtocol}
 **/
export const rwaProtocolSchema = z.enum(RWA_PROTOCOLS);

/**
 * {@link ./rwa.js#KycRequirement}
 **/
export const kycRequirementSchema = z.object({
  protocol: rwaProtocolSchema,
  token: tokenSchema.optional(),
  registrationLink: z.string(),
});
