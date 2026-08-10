import { z } from "zod/v4";
import { ZodAddress } from "../sdk/utils/zod.js";
import {
  assetTypeSchema,
  chainIdSchema,
  timestampSchema,
  tokenAmountSchema,
  tokenSchema,
  txCallSchema,
} from "./primitives.schema.js";

/**
 * Runtime schemas for {@link ./liquidations.js}, see the note in
 * `primitives.schema.ts` on why they are written by hand.
 **/

/**
 * {@link LiquidatableAccountFilter}
 **/
export const liquidatableAccountFilterSchema = z.object({
  chainIds: z.array(chainIdSchema).optional(),
  underlyingType: assetTypeSchema.optional(),
  paused: z.boolean().optional(),
  rwa: z.boolean().optional(),
  delayed: z.boolean().optional(),
});

/**
 * {@link LiquidatableAccount}
 **/
export const liquidatableAccountSchema = z.object({
  chainId: chainIdSchema,
  creditAccount: ZodAddress(),
  creditManager: ZodAddress(),
  asset: tokenSchema,
  totalValue: tokenAmountSchema,
  repaymentAmount: tokenAmountSchema,
  estimatedProfit: tokenAmountSchema,
  isDelayed: z.boolean(),
  paused: z.boolean(),
  rwa: z.boolean(),
});

/**
 * {@link InstantReceivedAsset}
 **/
export const instantReceivedAssetSchema = z.object({
  ...tokenAmountSchema.shape,
  isDelayed: z.literal(false),
});

/**
 * {@link DelayedReceivedAsset}
 **/
export const delayedReceivedAssetSchema = z.object({
  ...tokenAmountSchema.shape,
  isDelayed: z.literal(true),
  redeemer: ZodAddress().optional(),
  claimableAt: timestampSchema.optional(),
});

/**
 * {@link ReceivedAsset}
 **/
export const receivedAssetSchema = z.discriminatedUnion("isDelayed", [
  instantReceivedAssetSchema,
  delayedReceivedAssetSchema,
]);

/**
 * {@link LiquidationApproval}
 **/
export const liquidationApprovalSchema = tokenAmountSchema.extend({
  spender: ZodAddress(),
});

/**
 * {@link LiquidationPosition}
 **/
export const liquidationPositionSchema = z.object({
  kind: z.literal("liquidation"),
  chainId: chainIdSchema,
  sourceToken: tokenSchema,
  output: tokenAmountSchema,
  claimableAt: timestampSchema.optional(),
  claimTx: txCallSchema.optional(),
  redeemer: ZodAddress().optional(),
});

/**
 * {@link LiquidationDetails}
 **/
export const liquidationDetailsSchema = z.object({
  ...liquidatableAccountSchema.shape,
  repaymentAmount: tokenAmountSchema,
  receivedAssets: z.array(receivedAssetSchema),
  isLiquidatorEligible: z.boolean(),
  isCreditAccountFrozen: z.boolean(),
  kycProtocol: z.string().optional(),
  kycToken: tokenSchema.optional(),
  approve: liquidationApprovalSchema.optional(),
});
