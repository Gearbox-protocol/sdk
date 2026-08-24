import { z } from "zod/v4";
import { ZodAddress } from "../sdk/utils/zod.js";
import { offchainOnly, tolerance } from "./compare.schema.js";
import { curatorSchema } from "./curators.schema.js";
import { isFilterSet } from "./filters.js";
import {
  booleanParamSchema,
  encodeFlag,
  filterable,
} from "./filters.schema.js";
import type { OpportunityFilter } from "./opportunities.js";
import {
  amountSchema,
  assetTypeSchema,
  bpsSchema,
  chainIdSchema,
  leverageSchema,
  timestampSchema,
  tokenSchema,
} from "./primitives.schema.js";

/**
 * Runtime schemas for {@link ./opportunities.js}, see the note in
 * `primitives.schema.ts` on why they are written by hand.
 **/

/**
 * {@link OpportunityKind}
 **/
export const opportunityKindSchema = z.union([
  z.literal("pool"),
  z.literal("strategy"),
]);

/**
 * {@link PointsProgram}
 **/
export const pointsProgramSchema = z.object({
  id: z.string(),
  name: z.string(),
  multiplier: z.number().nullable(),
});

/**
 * {@link TokenRewards}
 **/
export const tokenRewardsSchema = z.object({
  kind: z.literal("token"),
  token: tokenSchema,
  supplyApr: bpsSchema.optional(),
  borrowApr: bpsSchema.optional(),
});

/**
 * {@link PointRewards}
 **/
export const pointRewardsSchema = z.object({
  kind: z.literal("point"),
  points: z.array(pointsProgramSchema),
});

/**
 * {@link Rewards}
 **/
export const rewardsSchema = z.discriminatedUnion("kind", [
  tokenRewardsSchema,
  pointRewardsSchema,
]);

/**
 * {@link ApyBreakdown}
 **/
export const apyBreakdownSchema = z.object({
  totalApy: offchainOnly(bpsSchema).optional(),
  organicApy: tolerance(bpsSchema, "bps"),
  rewards: offchainOnly(z.array(rewardsSchema)).optional(),
});

/**
 * {@link OpportunityBase}
 **/
export const opportunityBaseSchema = z.object({
  chainId: chainIdSchema,
  name: z.string(),
  curator: curatorSchema,
  underlyingToken: tokenSchema,
  totalBorrow: amountSchema,
  collateralTokens: z.array(tokenSchema),
  paused: z.boolean(),
  rwa: z.boolean(),
  sunset: z.boolean(),
});

/**
 * {@link PoolOpportunity}
 **/
export const poolOpportunitySchema = z.object({
  ...opportunityBaseSchema.shape,
  kind: z.literal("pool"),
  pool: ZodAddress(),
  totalSupply: tolerance(amountSchema, "amount"),
  availableLiquidity: tolerance(amountSchema, "amount"),
  utilization: tolerance(bpsSchema, "bps"),
  supplyApy: apyBreakdownSchema,
  supplyApyAvg7D: offchainOnly(apyBreakdownSchema).optional(),
});

/**
 * {@link StrategyOpportunity}
 **/
export const strategyOpportunitySchema = z.object({
  ...opportunityBaseSchema.shape,
  kind: z.literal("strategy"),
  creditManager: ZodAddress(),
  targetCollateral: tokenSchema,
  liquidationThreshold: bpsSchema,
  liquidationPremium: bpsSchema,
  liquidationFee: bpsSchema,
  expirationDate: timestampSchema.nullable(),
  collateralApy: offchainOnly(apyBreakdownSchema).optional(),
  collateralApyAvg7D: offchainOnly(apyBreakdownSchema).optional(),
  borrowApy: tolerance(bpsSchema, "bps"),
  borrowApyAvg7D: offchainOnly(bpsSchema).optional(),
  quotaRate: tolerance(bpsSchema, "bps"),
  quotaRateAvg7D: offchainOnly(bpsSchema).optional(),
  totalValue: offchainOnly(amountSchema).optional(),
  utilization: offchainOnly(bpsSchema).optional(),
  availableLiquidity: tolerance(amountSchema, "amount"),
  minDebt: amountSchema,
  totalDebtLimit: amountSchema,
  maxBorrowAmount: amountSchema,
  maxLeverage: leverageSchema,
});

/**
 * {@link Opportunity}
 **/
export const opportunitySchema = z.discriminatedUnion("kind", [
  poolOpportunitySchema,
  strategyOpportunitySchema,
]);

/**
 * {@link OpportunityFilter}
 **/
export const opportunityFilterSchema = z.object({
  kind: filterable(opportunityKindSchema).optional(),
  chainIds: z.array(chainIdSchema).optional(),
  underlyingType: filterable(assetTypeSchema).optional(),
  paused: filterable(z.boolean()).optional(),
  sunset: filterable(z.boolean()).optional(),
  rwa: filterable(z.boolean()).optional(),
});

/**
 * {@link OpportunityFilter} as a URL can carry it: every condition is a string,
 * and a condition that does not narrow is absent rather than empty.
 **/
export const opportunityFilterQueryParamsSchema = z.object({
  kind: opportunityKindSchema.optional(),
  chainIds: z
    .string()
    .regex(/^$|^\d+(,\d+)*$/)
    .optional(),
  underlyingType: assetTypeSchema.optional(),
  paused: booleanParamSchema.optional(),
  sunset: booleanParamSchema.optional(),
  rwa: booleanParamSchema.optional(),
});

/**
 * Code for {@link OpportunityFilter} to encode/decode to/from url query parameters.
 **/
export const opportunityFilterQuerySchema = z.codec(
  opportunityFilterQueryParamsSchema,
  opportunityFilterSchema,
  {
    decode: (params): OpportunityFilter => {
      const filter: OpportunityFilter = {};
      if (params.kind !== undefined) {
        filter.kind = params.kind;
      }
      if (params.chainIds !== undefined) {
        filter.chainIds =
          params.chainIds === "" ? [] : params.chainIds.split(",").map(Number);
      }
      if (params.underlyingType !== undefined) {
        filter.underlyingType = params.underlyingType;
      }
      if (params.paused !== undefined) {
        filter.paused = params.paused === "true";
      }
      if (params.sunset !== undefined) {
        filter.sunset = params.sunset === "true";
      }
      if (params.rwa !== undefined) {
        filter.rwa = params.rwa === "true";
      }
      return filter;
    },
    encode: (filter): OpportunityFilterQueryParams => ({
      kind: isFilterSet(filter.kind) ? filter.kind : undefined,
      chainIds: filter.chainIds?.join(","),
      underlyingType: isFilterSet(filter.underlyingType)
        ? filter.underlyingType
        : undefined,
      paused: encodeFlag(filter.paused),
      sunset: encodeFlag(filter.sunset),
      rwa: encodeFlag(filter.rwa),
    }),
  },
);

type OpportunityFilterQueryParams = z.input<
  typeof opportunityFilterQueryParamsSchema
>;

/**
 * {@link RateCurvePoint}
 **/
export const rateCurvePointSchema = z.object({
  utilization: bpsSchema,
  supplyApy: bpsSchema,
  borrowApy: bpsSchema,
});

/**
 * {@link RateCurve}
 **/
export const rateCurveSchema = z.object({
  points: z.array(rateCurvePointSchema),
  borrowingLimitUtilization: bpsSchema.nullable(),
});

/**
 * {@link QuotaAsset}
 **/
export const quotaAssetSchema = z.object({
  token: tokenSchema,
  quotaRate: bpsSchema,
  limit: amountSchema,
  used: amountSchema,
});

/**
 * {@link PriceFeedData}. Recursive: a composite feed lists the feeds it reads.
 **/
export const priceFeedDataSchema = z.object({
  name: z.string(),
  type: z.string(),
  feedAddress: ZodAddress(),
  get dependencies() {
    return z.array(priceFeedDataSchema);
  },
});

/**
 * {@link PriceFeedSummary}
 **/
export const priceFeedSummarySchema = z.object({
  underlyingPriceInUsd: z.number(),
  collateralPriceInUsd: z.number(),
  collateralPriceInUnderlying: z.number(),
  underlyingFeed: priceFeedDataSchema,
  collateralFeed: priceFeedDataSchema,
});

/**
 * {@link PoolOpportunityDetail}
 **/
export const poolOpportunityDetailSchema = z.object({
  ...poolOpportunitySchema.shape,
  rateCurve: rateCurveSchema,
  quotaAssets: z.array(quotaAssetSchema),
});

/**
 * {@link StrategyOpportunityDetail}
 **/
export const strategyOpportunityDetailSchema = z.object({
  ...strategyOpportunitySchema.shape,
  rateCurve: rateCurveSchema,
  priceFeeds: priceFeedSummarySchema,
});

/**
 * {@link OpportunityDetail}
 **/
export const opportunityDetailSchema = z.discriminatedUnion("kind", [
  poolOpportunityDetailSchema,
  strategyOpportunityDetailSchema,
]);

/**
 * {@link PoolOpportunityKey}
 **/
export const poolOpportunityKeySchema = z.object({
  chainId: chainIdSchema,
  pool: ZodAddress(),
});

/**
 * {@link StrategyOpportunityKey}
 **/
export const strategyOpportunityKeySchema = z.object({
  chainId: chainIdSchema,
  creditManager: ZodAddress(),
});

/**
 * {@link OpportunityKey}
 **/
export const opportunityKeySchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("pool"), ...poolOpportunityKeySchema.shape }),
  z.object({
    kind: z.literal("strategy"),
    ...strategyOpportunityKeySchema.shape,
  }),
]);
