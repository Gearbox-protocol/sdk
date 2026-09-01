import { type Address, isAddress } from "viem";
import { z } from "zod/v4";
import { ZodAddress } from "../onchain/utils/zod.js";
import type {
  AnalyticsPosition,
  AnalyticsPositionListOptions,
} from "./analytics.js";
import { isFilterSet } from "./filters.js";
import { encodeFlag, filterable } from "./filters.schema.js";
import { liquidationPositionSchema } from "./liquidations.schema.js";
import {
  poolPositionSchema,
  positionKindSchema,
  strategyPositionSchema,
} from "./positions.schema.js";
import { assetTypeSchema, chainIdSchema } from "./primitives.schema.js";

/** Default page size of the protocol-wide positions list. */
export const ANALYTICS_POSITIONS_DEFAULT_LIMIT = 25;

/** Largest page the protocol-wide positions list accepts. */
export const ANALYTICS_POSITIONS_MAX_LIMIT = 100;

/** {@link AnalyticsPositionSortField} */
export const analyticsPositionSortFieldSchema = z.enum([
  "netValueUsd",
  "totalValueUsd",
  "totalDebtUsd",
  "pnlUsd",
  "apy",
  "healthFactor",
  "leverage",
  "chainId",
  "name",
  "borrower",
]);

/** {@link AnalyticsSortDirection} */
export const analyticsSortDirectionSchema = z.enum(["asc", "desc"]);

const analyticsOwnerShape = { borrower: ZodAddress() };
const addressSchema = z.custom<Address>(
  value => typeof value === "string" && isAddress(value, { strict: false }),
);

/** {@link AnalyticsPosition} */
export const analyticsPositionSchema = z.discriminatedUnion("kind", [
  z.object({ ...poolPositionSchema.shape, ...analyticsOwnerShape }),
  z.object({ ...strategyPositionSchema.shape, ...analyticsOwnerShape }),
  z.object({ ...liquidationPositionSchema.shape, ...analyticsOwnerShape }),
]) as unknown as z.ZodType<AnalyticsPosition>;

/** {@link AnalyticsPositionListOptions} */
export const analyticsPositionListOptionsSchema = z.object({
  borrower: addressSchema.optional(),
  kind: filterable(positionKindSchema).optional(),
  isZeroDebt: filterable(z.boolean()).optional(),
  chainIds: z.array(chainIdSchema).optional(),
  underlyingType: filterable(assetTypeSchema).optional(),
  sortBy: analyticsPositionSortFieldSchema.optional(),
  sortDirection: analyticsSortDirectionSchema.optional(),
  offset: z.number().int().nonnegative().optional(),
  limit: z
    .number()
    .int()
    .positive()
    .max(ANALYTICS_POSITIONS_MAX_LIMIT)
    .optional(),
});

/**
 * {@link AnalyticsPositionListOptions} as URL query parameters.
 **/
export const analyticsPositionListQueryParamsSchema = z.object({
  borrower: z
    .string()
    .refine(value => isAddress(value, { strict: false }), "invalid address")
    .optional(),
  kind: positionKindSchema.optional(),
  isZeroDebt: z.enum(["true", "false"]).optional(),
  chainIds: z
    .string()
    .regex(/^$|^\d+(,\d+)*$/)
    .optional(),
  underlyingType: assetTypeSchema.optional(),
  sortBy: analyticsPositionSortFieldSchema.optional(),
  sortDirection: analyticsSortDirectionSchema.optional(),
  offset: z.string().regex(/^\d+$/).optional(),
  limit: z
    .string()
    .regex(/^[1-9]\d*$/)
    .optional(),
});

/**
 * Codec for an analytics position-list query. It is shared by the SDK client
 * and backend controller so both sides interpret every parameter identically.
 **/
export const analyticsPositionListQuerySchema = z.codec(
  analyticsPositionListQueryParamsSchema,
  analyticsPositionListOptionsSchema,
  {
    decode: (params): AnalyticsPositionListOptions => ({
      ...(params.borrower === undefined
        ? {}
        : { borrower: params.borrower as Address }),
      ...(params.kind === undefined ? {} : { kind: params.kind }),
      ...(params.isZeroDebt === undefined
        ? {}
        : { isZeroDebt: params.isZeroDebt === "true" }),
      ...(params.chainIds === undefined
        ? {}
        : {
            chainIds:
              params.chainIds === ""
                ? []
                : params.chainIds.split(",").map(Number),
          }),
      ...(params.underlyingType === undefined
        ? {}
        : { underlyingType: params.underlyingType }),
      ...(params.sortBy === undefined ? {} : { sortBy: params.sortBy }),
      ...(params.sortDirection === undefined
        ? {}
        : { sortDirection: params.sortDirection }),
      ...(params.offset === undefined ? {} : { offset: Number(params.offset) }),
      ...(params.limit === undefined ? {} : { limit: Number(params.limit) }),
    }),
    encode: options => ({
      borrower: options.borrower,
      kind: isFilterSet(options.kind) ? options.kind : undefined,
      isZeroDebt: encodeFlag(options.isZeroDebt),
      chainIds: options.chainIds?.join(","),
      underlyingType: isFilterSet(options.underlyingType)
        ? options.underlyingType
        : undefined,
      sortBy: options.sortBy,
      sortDirection: options.sortDirection,
      offset: options.offset?.toString(),
      limit: options.limit?.toString(),
    }),
  },
);

/** {@link AnalyticsPositionPage} */
export const analyticsPositionPageSchema = z.object({
  items: z.array(analyticsPositionSchema),
  total: z.number().int().nonnegative(),
  offset: z.number().int().nonnegative(),
  limit: z.number().int().positive().max(ANALYTICS_POSITIONS_MAX_LIMIT),
});
