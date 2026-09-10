import { z } from "zod/v4";
import { tokenSchema } from "./primitives.schema.js";
import { KYC_PROTOCOLS } from "./rwa.js";

/**
 * {@link ./rwa.js#KycProtocol}
 **/
export const kycProtocolSchema = z.enum(KYC_PROTOCOLS);

/**
 * {@link ./rwa.js#KycRequirement}
 **/
export const kycRequirementSchema = z.object({
  protocol: kycProtocolSchema,
  token: tokenSchema.optional(),
  registrationLink: z.string(),
});
