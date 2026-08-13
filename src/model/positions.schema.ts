import { z } from "zod/v4";
import { ZodAddress } from "../sdk/utils/zod.js";
import { filterable } from "./filters.schema.js";
import {
  delayedReceivedAssetSchema,
  liquidationPositionSchema,
} from "./liquidations.schema.js";
import {
  apyBreakdownSchema,
  pointsProgramSchema,
} from "./opportunities.schema.js";
import {
  assetTypeSchema,
  bpsSchema,
  chainIdSchema,
  leverageSchema,
  tokenAmountSchema,
  tokenSchema,
} from "./primitives.schema.js";

/**
 * Runtime schemas for {@link ./positions.js}, see the note in
 * `primitives.schema.ts` on why they are written by hand.
 **/

/**
 * {@link PositionKind}
 **/
export const positionKindSchema = z.union([
  z.literal("pool"),
  z.literal("strategy"),
  z.literal("liquidation"),
]);

/**
 * {@link TokenRewardsPnL}
 **/
export const tokenRewardsPnLSchema = z.object({
  ...tokenAmountSchema.shape,
  kind: z.literal("token"),
});

/**
 * {@link PointsProgramPnL}
 **/
export const pointsProgramPnLSchema = z.object({
  ...pointsProgramSchema.shape,
  value: z.number(),
});

/**
 * {@link PointsRewardsPnL}
 **/
export const pointsRewardsPnLSchema = z.object({
  kind: z.literal("point"),
  points: z.array(pointsProgramPnLSchema),
});

/**
 * {@link RewardsPnL}
 **/
export const rewardsPnLSchema = z.discriminatedUnion("kind", [
  tokenRewardsPnLSchema,
  pointsRewardsPnLSchema,
]);

/**
 * {@link PnlBreakdown}
 **/
export const pnlBreakdownSchema = z.object({
  organic: tokenAmountSchema,
  total: tokenAmountSchema,
  rewards: z.array(rewardsPnLSchema),
});

/**
 * {@link PositionCollateral}
 **/
export const positionCollateralSchema = z.object({
  collateral: tokenAmountSchema,
  quota: tokenAmountSchema,
  withdrawals: z.array(delayedReceivedAssetSchema),
});

/**
 * {@link PoolPosition}
 **/
export const poolPositionSchema = z.object({
  kind: z.literal("pool"),
  name: z.string(),
  chainId: chainIdSchema,
  pool: ZodAddress(),
  netValue: tokenAmountSchema,
  apy: apyBreakdownSchema,
  pnl: pnlBreakdownSchema.optional(),
});

/**
 * {@link StrategyPosition}
 **/
export const strategyPositionSchema = z.object({
  kind: z.literal("strategy"),
  name: z.string(),
  chainId: chainIdSchema,
  creditManager: ZodAddress(),
  creditAccount: ZodAddress(),
  targetCollateral: tokenSchema.nullable(),
  leverage: leverageSchema,
  borrowApy: bpsSchema,
  netApy: apyBreakdownSchema.optional(),
  totalDebt: tokenAmountSchema,
  totalValue: tokenAmountSchema,
  healthFactor: bpsSchema,
  pnl: pnlBreakdownSchema.optional(),
  collaterals: z.array(positionCollateralSchema),
});

/**
 * {@link Position}
 **/
export const positionSchema = z.discriminatedUnion("kind", [
  poolPositionSchema,
  strategyPositionSchema,
  liquidationPositionSchema,
]);

/**
 * {@link PositionFilter}
 **/
export const positionFilterSchema = z.object({
  kind: filterable(positionKindSchema).optional(),
  isZeroDebt: filterable(z.boolean()).optional(),
  chainIds: filterable(z.array(chainIdSchema)).optional(),
  underlyingType: filterable(assetTypeSchema).optional(),
});

/**
 * {@link PoolPositionKey}
 **/
export const poolPositionKeySchema = z.object({
  chainId: chainIdSchema,
  pool: ZodAddress(),
  wallet: ZodAddress(),
});

/**
 * {@link StrategyPositionKey}
 **/
export const strategyPositionKeySchema = z.object({
  chainId: chainIdSchema,
  creditAccount: ZodAddress(),
});

/**
 * {@link PositionKey}
 **/
export const positionKeySchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("pool"), ...poolPositionKeySchema.shape }),
  z.object({ kind: z.literal("strategy"), ...strategyPositionKeySchema.shape }),
]);
