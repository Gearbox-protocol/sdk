import { z } from "zod/v4";
import { ZodAddress } from "../onchain/utils/zod.js";
import { delayedIntentSchema } from "./delayed-intent.schema.js";
import {
  timestampSchema,
  tokenAmountSchema,
  tokenSchema,
  txCallSchema,
} from "./primitives.schema.js";

/**
 * {@link PositionClaimableWithdrawal}
 **/
export const positionClaimableWithdrawalSchema = z.object({
  sourceToken: tokenSchema,
  withdrawalPhantomToken: tokenAmountSchema,
  outputs: z.array(tokenAmountSchema),
  claimCall: txCallSchema,
  redeemer: ZodAddress().optional(),
  intent: delayedIntentSchema.optional(),
});

/**
 * {@link PositionPendingWithdrawal}
 **/
export const positionPendingWithdrawalSchema = z.object({
  sourceToken: tokenSchema,
  withdrawalPhantomToken: tokenSchema,
  expectedOutputs: z.array(tokenAmountSchema),
  claimableAt: timestampSchema,
  redeemer: ZodAddress().optional(),
  intent: delayedIntentSchema.optional(),
});

/**
 * {@link PositionWithdrawals}
 **/
export const positionWithdrawalsSchema = z.object({
  claimable: z.array(positionClaimableWithdrawalSchema),
  pending: z.array(positionPendingWithdrawalSchema),
});
