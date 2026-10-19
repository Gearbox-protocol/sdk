import { type Address, isAddress } from "viem";
import { z } from "zod/v4";
import { ZodAddress } from "../onchain/utils/zod.js";
import type {
  AnalyticsChartQuery,
  AnalyticsContractRef,
  AnalyticsPosition,
  AnalyticsPositionListOptions,
} from "./analytics.js";
import type { ProtocolChartMetric } from "./charts.js";
import {
  chartRangeSchema,
  protocolChartMetricSchema,
} from "./charts.schema.js";
import type { CuratorName } from "./curators.js";
import { curatorNameSchema, curatorSchema } from "./curators.schema.js";
import { isFilterSet } from "./filters.js";
import { encodeFlag, filterable } from "./filters.schema.js";
import { liquidationPositionSchema } from "./liquidations.schema.js";
import {
  poolPositionSchema,
  positionKindSchema,
  strategyPositionSchema,
} from "./positions.schema.js";
import {
  assetTypeSchema,
  chainIdSchema,
  tokenSchema,
  underlyingTokenSchema,
} from "./primitives.schema.js";

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
  "healthFactor",
]);

/** {@link AnalyticsSortDirection} */
export const analyticsSortDirectionSchema = z.enum(["asc", "desc"]);

const analyticsOwnerShape = { borrower: ZodAddress() };
const addressSchema = z.custom<Address>(
  value => typeof value === "string" && isAddress(value, { strict: false }),
);
const addressParamSchema = z
  .string()
  .refine(value => isAddress(value, { strict: false }), "invalid address");
/** {@link AnalyticsContractRef} */
export const analyticsContractRefSchema = z.object({
  chainId: chainIdSchema,
  address: addressSchema,
});
const contractFilterSchema = z.union([
  analyticsContractRefSchema,
  z.array(analyticsContractRefSchema).readonly(),
]);
// chain IDs and addresses are checked by `analyticsContractRefSchema`, which
// the codec applies to the decoded result
const contractFilterParamSchema = z.string().regex(/^$|^\d+:\w+(,\d+:\w+)*$/);

/** Decode comma-separated choices, preserving scalar reads and empty lists. */
function decodeChoices<T>(
  param: string,
  decode: (choice: string) => T,
): T | readonly T[] {
  const choices = param === "" ? [] : param.split(",").map(decode);
  return choices.length === 1 ? choices[0] : choices;
}

function encodeChoices<T>(
  choices: T | readonly T[] | undefined,
  encode: (choice: T) => string,
): string | undefined {
  if (choices === undefined) {
    return undefined;
  }
  return ([] as T[]).concat(choices).map(encode).join(",");
}

function decodeContractRef(param: string): AnalyticsContractRef {
  const [chainId, address] = param.split(":");
  return { chainId: Number(chainId), address: address as Address };
}

function encodeContractRef(ref: AnalyticsContractRef): string {
  return `${ref.chainId}:${ref.address}`;
}

/** {@link AnalyticsPosition} */
export const analyticsPositionSchema = z.discriminatedUnion("kind", [
  z.object({ ...poolPositionSchema.shape, ...analyticsOwnerShape }),
  z.object({ ...strategyPositionSchema.shape, ...analyticsOwnerShape }),
  z.object({ ...liquidationPositionSchema.shape, ...analyticsOwnerShape }),
]) as unknown as z.ZodType<AnalyticsPosition>;

/** {@link AnalyticsPositionListOptions} */
export const analyticsPositionListOptionsSchema = z.object({
  borrower: addressSchema.optional(),
  pool: contractFilterSchema.optional(),
  creditManager: contractFilterSchema.optional(),
  asset: contractFilterSchema.optional(),
  curator: filterable(
    z.union([curatorNameSchema, z.array(curatorNameSchema).readonly()]),
  ).optional(),
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
 * Pool, credit manager and asset choices are comma-separated `chainId:address`
 * references; curator choices are comma-separated names. An empty string
 * carries an empty list rather than an unrestricted condition.
 **/
export const analyticsPositionListQueryParamsSchema = z.object({
  borrower: addressParamSchema.optional(),
  pool: contractFilterParamSchema.optional(),
  creditManager: contractFilterParamSchema.optional(),
  asset: contractFilterParamSchema.optional(),
  // members are checked by `analyticsPositionListOptionsSchema`, which the
  // codec applies to the decoded result
  curator: z.string().optional(),
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
      ...(params.pool === undefined
        ? {}
        : { pool: decodeChoices(params.pool, decodeContractRef) }),
      ...(params.creditManager === undefined
        ? {}
        : {
            creditManager: decodeChoices(
              params.creditManager,
              decodeContractRef,
            ),
          }),
      ...(params.asset === undefined
        ? {}
        : { asset: decodeChoices(params.asset, decodeContractRef) }),
      ...(params.curator === undefined
        ? {}
        : {
            curator: decodeChoices(params.curator, name => name as CuratorName),
          }),
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
      pool: encodeChoices(options.pool, encodeContractRef),
      creditManager: encodeChoices(options.creditManager, encodeContractRef),
      asset: encodeChoices(options.asset, encodeContractRef),
      curator: isFilterSet(options.curator)
        ? encodeChoices(options.curator, name => name)
        : undefined,
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

/** {@link AnalyticsContractOption} */
export const analyticsContractOptionSchema = z.object({
  chainId: chainIdSchema,
  address: ZodAddress(),
  name: z.string(),
  underlyingToken: underlyingTokenSchema,
  curator: curatorSchema,
});

/** {@link AnalyticsCuratorOption} */
export const analyticsCuratorOptionSchema = z.object({
  name: curatorNameSchema,
  url: z.string().nullable(),
});

/** {@link AnalyticsPositionFilterOptions} */
export const analyticsPositionFilterOptionsSchema = z.object({
  pools: z.array(analyticsContractOptionSchema),
  creditManagers: z.array(analyticsContractOptionSchema),
  assets: z.array(tokenSchema),
  curators: z.array(analyticsCuratorOptionSchema),
});

/** Chain scope of a filter-options read, shared by the client and backend. */
export const analyticsPositionFilterOptionsQuerySchema = z.codec(
  analyticsPositionListQueryParamsSchema.pick({ chainIds: true }),
  analyticsPositionListOptionsSchema.pick({ chainIds: true }),
  {
    decode: params =>
      params.chainIds === undefined
        ? {}
        : {
            chainIds:
              params.chainIds === ""
                ? []
                : params.chainIds.split(",").map(Number),
          },
    encode: filter => ({ chainIds: filter.chainIds?.join(",") }),
  },
);

/**
 * {@link AnalyticsChartQuery}
 *
 * The metric list is narrowed to {@link ProtocolChartMetric} here rather than
 * on the route, so asking the protocol chart for an opportunity metric is
 * rejected by the one codec both sides share instead of by a check only the
 * backend runs.
 **/
export const analyticsChartQueryOptionsSchema = z.object({
  metrics: z
    .array(protocolChartMetricSchema)
    .readonly()
    .refine(metrics => metrics.length > 0, {
      error: "a chart read needs at least one metric",
    })
    .refine(metrics => new Set(metrics).size === metrics.length, {
      error: "a chart read needs distinct metrics",
    }),
  range: chartRangeSchema,
  chainIds: z.array(chainIdSchema).optional(),
});

/**
 * {@link AnalyticsChartQuery} as URL query parameters: the metrics comma-joined
 * like every other chart read, and the chains comma-joined like every other
 * analytics read.
 **/
export const analyticsChartQueryParamsSchema = z.object({
  metrics: z.string().regex(/^\w+(,\w+)*$/),
  range: chartRangeSchema,
  chainIds: z
    .string()
    .regex(/^$|^\d+(,\d+)*$/)
    .optional(),
});

/**
 * Codec for a protocol-wide chart query. It is shared by the SDK client and
 * backend controller so both sides interpret every parameter identically.
 **/
export const analyticsChartQuerySchema = z.codec(
  analyticsChartQueryParamsSchema,
  analyticsChartQueryOptionsSchema,
  {
    decode: (params): AnalyticsChartQuery => ({
      // members are checked by `analyticsChartQueryOptionsSchema`, which the
      // codec applies to this result; the split can only produce strings
      metrics: params.metrics.split(",") as ProtocolChartMetric[],
      range: params.range,
      ...(params.chainIds === undefined
        ? {}
        : {
            chainIds:
              params.chainIds === ""
                ? []
                : params.chainIds.split(",").map(Number),
          }),
    }),
    encode: (query): z.input<typeof analyticsChartQueryParamsSchema> => ({
      metrics: query.metrics.join(","),
      range: query.range,
      chainIds: query.chainIds?.join(","),
    }),
  },
);
