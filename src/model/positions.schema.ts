import { z } from "zod/v4";
import { ZodAddress, ZodBigInt, ZodHex } from "../onchain/utils/zod.js";
import { offchainOnly, onchainOnly, tolerance } from "./compare.schema.js";
import { isFilterSet } from "./filters.js";
import {
  booleanParamSchema,
  encodeFlag,
  filterable,
} from "./filters.schema.js";
import {
  delayedReceivedAssetSchema,
  liquidationPositionSchema,
} from "./liquidations.schema.js";
import {
  apyBreakdownSchema,
  pointsProgramSchema,
} from "./opportunities.schema.js";
import type { PositionFilter } from "./positions.js";
import {
  assetTypeSchema,
  bpsSchema,
  chainIdSchema,
  leverageSchema,
  timestampSchema,
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
  collateral: tolerance(tokenAmountSchema, "amount"),
  quota: tolerance(tokenAmountSchema, "amount"),
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
  netValue: tolerance(tokenAmountSchema, "amount"),
  apy: apyBreakdownSchema,
  apyAvg7D: offchainOnly(apyBreakdownSchema).optional(),
  pnl: offchainOnly(pnlBreakdownSchema).optional(),
});

/**
 * {@link TokenQuotaRate}
 **/
export const tokenQuotaRateSchema = z.object({
  token: tokenSchema,
  rate: bpsSchema,
});

/**
 * {@link BorrowRateBreakdown}
 **/
export const borrowRateBreakdownSchema = z.object({
  total: bpsSchema,
  totalOnDebt: bpsSchema,
  base: bpsSchema,
  quotas: z.array(tokenQuotaRateSchema),
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
  leverage: tolerance(leverageSchema, "float"),
  borrowApy: tolerance(bpsSchema, "bps"),
  borrowApyAvg7D: offchainOnly(bpsSchema).optional(),
  netApy: offchainOnly(apyBreakdownSchema).optional(),
  netApyAvg7D: offchainOnly(apyBreakdownSchema).optional(),
  totalDebt: tolerance(tokenAmountSchema, "amount"),
  totalValue: tolerance(tokenAmountSchema, "amount"),
  healthFactor: tolerance(bpsSchema, "bps"),
  borrowRate: onchainOnly(borrowRateBreakdownSchema).optional(),
  borrowRateAvg7D: offchainOnly(borrowRateBreakdownSchema).optional(),
  timeToLiquidation: onchainOnly(ZodBigInt().nullable()).optional(),
  liquidationPrice: onchainOnly(ZodBigInt().nullable()).optional(),
  pnl: offchainOnly(pnlBreakdownSchema).optional(),
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
  chainIds: z.array(chainIdSchema).optional(),
  underlyingType: filterable(assetTypeSchema).optional(),
});

/**
 * {@link PositionFilter} as a URL can carry it: every condition is a string,
 * and a condition that does not narrow is absent rather than empty.
 **/
export const positionFilterQueryParamsSchema = z.object({
  kind: positionKindSchema.optional(),
  isZeroDebt: booleanParamSchema.optional(),
  chainIds: z
    .string()
    .regex(/^$|^\d+(,\d+)*$/)
    .optional(),
  underlyingType: assetTypeSchema.optional(),
});

/**
 * Code for {@link PositionFilter} to encode/decode to/from url query parameters.
 **/
export const positionFilterQuerySchema = z.codec(
  positionFilterQueryParamsSchema,
  positionFilterSchema,
  {
    decode: (params): PositionFilter => {
      const filter: PositionFilter = {};
      if (params.kind !== undefined) {
        filter.kind = params.kind;
      }
      if (params.isZeroDebt !== undefined) {
        filter.isZeroDebt = params.isZeroDebt === "true";
      }
      if (params.chainIds !== undefined) {
        filter.chainIds =
          params.chainIds === "" ? [] : params.chainIds.split(",").map(Number);
      }
      if (params.underlyingType !== undefined) {
        filter.underlyingType = params.underlyingType;
      }
      return filter;
    },
    encode: (filter): PositionFilterQueryParams => ({
      kind: isFilterSet(filter.kind) ? filter.kind : undefined,
      isZeroDebt: encodeFlag(filter.isZeroDebt),
      chainIds: filter.chainIds?.join(","),
      underlyingType: isFilterSet(filter.underlyingType)
        ? filter.underlyingType
        : undefined,
    }),
  },
);

type PositionFilterQueryParams = z.input<
  typeof positionFilterQueryParamsSchema
>;

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

/**
 * {@link PositionsTotals}
 **/
export const positionsTotalsSchema = z.object({
  currentYield: apyBreakdownSchema.nullable(),
  pnl: pnlBreakdownSchema.nullable(),
  netValueUsd: z.number().nullable(),
  claimableUsd: z.number().nullable(),
});

/**
 * {@link PositionTransactionKind}
 **/
export const positionTransactionKindSchema = z.union([
  z.literal("open"),
  z.literal("deposit"),
  z.literal("withdraw"),
  z.literal("adjustLeverage"),
  z.literal("addCollateral"),
  z.literal("withdrawCollateral"),
  z.literal("liquidation"),
]);

/**
 * {@link PositionTransaction}
 **/
export const positionTransactionSchema = z.object({
  txHash: ZodHex(),
  timestamp: timestampSchema,
  kind: positionTransactionKindSchema,
  assets: z.array(tokenAmountSchema),
});
