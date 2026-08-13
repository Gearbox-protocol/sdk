import { z } from "zod/v4";
import { ZodAddress, ZodHex } from "../sdk/utils/zod.js";

/**
 * Runtime schemas for {@link ./primitives.js}.
 *
 * The hand-written types are the contract; these schemas exist so the offchain
 * client can reject a backend response that no longer matches it. The two are
 * kept in sync by the type-level tests in `model.test-d.ts`, not by inferring
 * one from the other.
 **/

/**
 * {@link ChainId}
 **/
export const chainIdSchema = z.number().int().positive();

/**
 * {@link Timestamp}
 **/
export const timestampSchema = z.number().int().nonnegative();

/**
 * {@link Bps}. Integer, not bounded to `0..10000`: rates may exceed 100%.
 **/
export const bpsSchema = z.number().int();

/**
 * {@link AssetType}
 **/
export const assetTypeSchema = z.union([
  z.literal("Stable"),
  z.literal("ETH"),
  z.literal("BTC"),
]);

/**
 * {@link Leverage}
 **/
export const leverageSchema = z.number().positive();

/**
 * {@link Amount}
 **/
export const amountSchema = z.object({
  value: z.bigint(),
  valueUsd: z.number().nullable(),
});

/**
 * {@link Token}
 **/
export const tokenSchema = z.object({
  chainId: chainIdSchema,
  address: ZodAddress(),
  symbol: z.string(),
  name: z.string(),
  decimals: z.number().int().nonnegative(),
  assetType: assetTypeSchema.optional(),
});

/**
 * {@link TokenAmount}
 **/
export const tokenAmountSchema = amountSchema.extend({
  token: tokenSchema,
});

/**
 * {@link TxCall}
 **/
export const txCallSchema = z.object({
  to: ZodAddress(),
  callData: ZodHex(),
  value: z.bigint().optional(),
});
