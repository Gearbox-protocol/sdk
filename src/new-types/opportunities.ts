import { z } from "zod";

import {
  addressSchema,
  amountSchema,
  assetClassSchema,
  chainIdSchema,
  finiteNumberSchema,
  nonNegativeNumberSchema,
  parsePoolId,
  parseStrategyId,
  poolIdSchema,
  rateSchema,
  ratioSchema,
  strategyIdSchema,
  timestampSchema,
  tokenSchema,
} from "./common.js";
import type {
  Curator,
  CuratorActionChange,
  EarnOpportunityDetail,
  EarnOpportunityRow,
  Lifecycle,
  LiquidationSummary,
  Liquidity,
  OpportunityKind,
  OpportunityMarket,
  OpportunityStatus,
  OpportunityYield,
  OracleDependency,
  OracleKind,
  OraclePair,
  OracleRow,
  OracleSummary,
  PendingCuratorAction,
  PointsProgram,
  PoolFeatures,
  PoolOpportunityDetail,
  PoolOpportunityRow,
  PoolPerformance,
  ProjectedPoints,
  QuotaAsset,
  RateCurve,
  RateCurvePoint,
  RewardTokenYield,
  StrategyApyBreakdown,
  StrategyFeatures,
  StrategyOpportunityDetail,
  StrategyOpportunityRow,
  StrategyWalletEstimate,
  Token,
} from "./types.js";

// ---------------------------------------------------------------------------
// Shared groups
// ---------------------------------------------------------------------------

export const opportunityKindSchema = z.enum([
  "pool",
  "strategy",
]) satisfies z.ZodType<OpportunityKind>;

export const lifecycleSchema = z.enum([
  "active",
  "paused",
  "shutdown",
]) satisfies z.ZodType<Lifecycle>;

export const opportunityStatusSchema = z.object({
  lifecycle: lifecycleSchema,
  canDeposit: z.boolean(),
  isDefaultVisible: z.boolean(),
}) satisfies z.ZodType<OpportunityStatus>;

export const curatorSchema = z.object({
  address: addressSchema,
  name: z.string().trim().min(1),
  url: z.string().trim().min(1).nullable(),
}) satisfies z.ZodType<Curator>;

export const opportunityMarketSchema = z.object({
  configuratorAddress: addressSchema.nullable(),
  curator: curatorSchema.nullable(),
}) satisfies z.ZodType<OpportunityMarket>;

export const poolFeaturesSchema = z.object({
  isRwa: z.boolean(),
  hasDelayedWithdrawal: z.boolean(),
}) satisfies z.ZodType<PoolFeatures>;

export const strategyFeaturesSchema = poolFeaturesSchema.extend({
  /** Presence is the zero-slippage signal; there is no duplicate boolean. */
  zeroSlippageToken: tokenSchema.nullable(),
  hasDeleverageBot: z.boolean(),
}) satisfies z.ZodType<StrategyFeatures>;

export const liquiditySchema = z.object({
  supplied: amountSchema,
  borrowed: amountSchema,
  available: amountSchema,
  utilization: ratioSchema,
}) satisfies z.ZodType<Liquidity>;

export const rewardTokenYieldSchema = z.object({
  token: tokenSchema,
  apr: rateSchema,
}) satisfies z.ZodType<RewardTokenYield>;

export const pointsProgramSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  multiplier: nonNegativeNumberSchema.nullable(),
  isPending: z.boolean(),
}) satisfies z.ZodType<PointsProgram>;

export const opportunityYieldSchema = z.object({
  totalApy: rateSchema,
  baseApy: rateSchema,
  rewardApr: rateSchema,
  rewards: z.array(rewardTokenYieldSchema),
  points: z.array(pointsProgramSchema),
}) satisfies z.ZodType<OpportunityYield>;

export const projectedPointsSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  amount: nonNegativeNumberSchema,
}) satisfies z.ZodType<ProjectedPoints>;

export const strategyWalletEstimateSchema = z.object({
  eligible: z.boolean(),
  inputValueUsd: nonNegativeNumberSchema,
  annualEarningsUsd: finiteNumberSchema.nullable(),
  projectedPoints: z.array(projectedPointsSchema),
}) satisfies z.ZodType<StrategyWalletEstimate>;

// ---------------------------------------------------------------------------
// Detail-only groups
// ---------------------------------------------------------------------------

export const poolPerformanceSchema = z.object({
  averageApy: z.object({
    oneDay: rateSchema,
    sevenDays: rateSchema,
    thirtyDays: rateSchema,
  }),
  apySevenDaysAgo: rateSchema.nullable(),
}) satisfies z.ZodType<PoolPerformance>;

export const rateCurvePointSchema = z.object({
  utilization: ratioSchema,
  supplyApy: rateSchema,
  borrowApy: rateSchema,
}) satisfies z.ZodType<RateCurvePoint>;

export const rateCurveSchema = z
  .object({
    points: z.array(rateCurvePointSchema),
    borrowingLimitUtilization: ratioSchema.nullable(),
  })
  .superRefine((curve, ctx) => {
    for (let index = 1; index < curve.points.length; index += 1) {
      if (
        curve.points[index].utilization <= curve.points[index - 1].utilization
      ) {
        ctx.addIssue({
          code: "custom",
          message:
            "Rate curve points must have strictly increasing utilization",
          path: ["points", index, "utilization"],
        });
      }
    }
  }) satisfies z.ZodType<RateCurve>;

export const quotaAssetSchema = z.object({
  token: tokenSchema,
  quotaRate: rateSchema,
  limit: amountSchema,
  used: amountSchema.nullable(),
  isActive: z.boolean(),
}) satisfies z.ZodType<QuotaAsset>;

export const curatorActionChangeSchema = z.object({
  label: z.string().trim().min(1),
  token: tokenSchema.nullable(),
  /** Final display strings, never machine-usable protocol inputs. */
  before: z.string().nullable(),
  after: z.string().nullable(),
}) satisfies z.ZodType<CuratorActionChange>;

export const pendingCuratorActionSchema = z.object({
  kind: z.string().trim().min(1),
  executeAt: timestampSchema,
  changes: z.array(curatorActionChangeSchema),
}) satisfies z.ZodType<PendingCuratorAction>;

export const strategyApyBreakdownSchema = z.object({
  collateralApy: rateSchema,
  baseBorrowApy: rateSchema,
  additionalBorrowApy: rateSchema,
}) satisfies z.ZodType<StrategyApyBreakdown>;

export const liquidationSummarySchema = z.object({
  threshold: ratioSchema,
  premium: rateSchema,
  fee: rateSchema,
  penalty: rateSchema,
}) satisfies z.ZodType<LiquidationSummary>;

export const oraclePairSchema = z.enum([
  "collateral/underlying",
  "collateral/usd",
  "underlying/usd",
]) satisfies z.ZodType<OraclePair>;

export const oracleKindSchema = z.enum([
  "fundamental",
  "market",
  "hardcoded",
  "derived",
]) satisfies z.ZodType<OracleKind>;

export const oracleDependencySchema = z.object({
  label: z.string().trim().min(1),
  address: addressSchema,
}) satisfies z.ZodType<OracleDependency>;

export const oracleRowSchema = z.object({
  pair: oraclePairSchema,
  price: nonNegativeNumberSchema,
  kind: oracleKindSchema,
  dependsOn: z.string(),
  feedAddress: addressSchema.nullable(),
  /** Flat summary; null means unavailable. */
  dependencies: z.array(oracleDependencySchema).nullable(),
}) satisfies z.ZodType<OracleRow>;

export const oracleSummarySchema = z.object({
  address: addressSchema.nullable(),
  rows: z.array(oracleRowSchema),
}) satisfies z.ZodType<OracleSummary>;

// ---------------------------------------------------------------------------
// Identity refinement
// ---------------------------------------------------------------------------

function isToken(value: Record<string, unknown>): boolean {
  return (
    typeof value.chainId === "number" &&
    typeof value.address === "string" &&
    typeof value.symbol === "string" &&
    typeof value.decimals === "number"
  );
}

/**
 * Single walk over an already-parsed row or detail that yields every embedded
 * token together with the path it was found at. Because details extend the row
 * object, the same walk covers both shapes.
 */
function* walkTokens(
  value: unknown,
  path: ReadonlyArray<string | number>,
): Generator<{ token: Token; path: Array<string | number> }> {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      yield* walkTokens(value[index], [...path, index]);
    }
    return;
  }

  if (value === null || typeof value !== "object") return;

  const candidate = value as Record<string, unknown>;

  if (isToken(candidate)) {
    yield { token: candidate as unknown as Token, path: [...path] };
    return;
  }

  for (const [key, child] of Object.entries(candidate)) {
    yield* walkTokens(child, [...path, key]);
  }
}

function validateTokenChains(
  shape: unknown,
  chainId: number,
  ctx: z.RefinementCtx,
): void {
  for (const { token, path } of walkTokens(shape, [])) {
    if (token.chainId !== chainId) {
      ctx.addIssue({
        code: "custom",
        message: "Embedded token belongs to a different chain",
        path: [...path, "chainId"],
      });
    }
  }
}

function validatePoolIdentity(
  row: PoolOpportunityRow,
  ctx: z.RefinementCtx,
): void {
  const parsed = parsePoolId(row.id);

  if (parsed.chainId !== row.chainId) {
    ctx.addIssue({
      code: "custom",
      message: "Opportunity chain does not match its ID",
      path: ["chainId"],
    });
  }

  if (parsed.poolAddress !== row.poolAddress) {
    ctx.addIssue({
      code: "custom",
      message: "Pool address does not match its ID",
      path: ["poolAddress"],
    });
  }

  validateTokenChains(row, row.chainId, ctx);
}

function validateStrategyIdentity(
  row: StrategyOpportunityRow,
  ctx: z.RefinementCtx,
): void {
  const parsed = parseStrategyId(row.id);

  if (parsed.chainId !== row.chainId) {
    ctx.addIssue({
      code: "custom",
      message: "Opportunity chain does not match its ID",
      path: ["chainId"],
    });
  }

  if (parsed.creditManagerAddress !== row.creditManagerAddress) {
    ctx.addIssue({
      code: "custom",
      message: "Credit manager does not match its ID",
      path: ["creditManagerAddress"],
    });
  }

  if (parsed.targetCollateralAddress !== row.targetCollateral.address) {
    ctx.addIssue({
      code: "custom",
      message: "Target collateral does not match its ID",
      path: ["targetCollateral", "address"],
    });
  }

  validateTokenChains(row, row.chainId, ctx);
}

// ---------------------------------------------------------------------------
// Rows and details
// ---------------------------------------------------------------------------

const earnOpportunityRowObject = z.object({
  chainId: chainIdSchema,
  title: z.string().trim().min(1),
  underlyingToken: tokenSchema,
  assetClass: assetClassSchema,
  status: opportunityStatusSchema,
  market: opportunityMarketSchema,
  liquidity: liquiditySchema,
  yield: opportunityYieldSchema,
  collateralTokens: z.array(tokenSchema),
});

const poolOpportunityRowObject = earnOpportunityRowObject.extend({
  kind: z.literal("pool"),
  id: poolIdSchema,
  poolAddress: addressSchema,
  /** Final label appended to the title, e.g. "v3". */
  version: z.string().trim().min(1),
  features: poolFeaturesSchema,
});

const strategyOpportunityRowObject = earnOpportunityRowObject.extend({
  kind: z.literal("strategy"),
  id: strategyIdSchema,
  creditManagerAddress: addressSchema,
  targetCollateral: tokenSchema,
  maxLeverage: nonNegativeNumberSchema.nullable(),
  features: strategyFeaturesSchema,
  /** Null when the list was requested without an owner. */
  walletEstimate: strategyWalletEstimateSchema.nullable(),
});

export const poolOpportunityRowSchema = poolOpportunityRowObject.superRefine(
  validatePoolIdentity,
) satisfies z.ZodType<PoolOpportunityRow>;

export const strategyOpportunityRowSchema =
  strategyOpportunityRowObject.superRefine(
    validateStrategyIdentity,
  ) satisfies z.ZodType<StrategyOpportunityRow>;

export const earnOpportunityRowSchema = z.discriminatedUnion("kind", [
  poolOpportunityRowSchema,
  strategyOpportunityRowSchema,
]) satisfies z.ZodType<EarnOpportunityRow>;

/** Details extend the row object, so no field is declared in two shapes. */
export const poolOpportunityDetailSchema = poolOpportunityRowObject
  .extend({
    performance: poolPerformanceSchema,
    rateCurve: rateCurveSchema,
    quotaAssets: z.array(quotaAssetSchema),
    pendingCuratorActions: z.array(pendingCuratorActionSchema),
  })
  .superRefine(validatePoolIdentity) satisfies z.ZodType<PoolOpportunityDetail>;

export const strategyOpportunityDetailSchema = strategyOpportunityRowObject
  .extend({
    apyBreakdown: strategyApyBreakdownSchema,
    rateCurve: rateCurveSchema,
    liquidation: liquidationSummarySchema,
    oracle: oracleSummarySchema,
  })
  .superRefine(
    validateStrategyIdentity,
  ) satisfies z.ZodType<StrategyOpportunityDetail>;

export const earnOpportunityDetailSchema = z.discriminatedUnion("kind", [
  poolOpportunityDetailSchema,
  strategyOpportunityDetailSchema,
]) satisfies z.ZodType<EarnOpportunityDetail>;

/**
 * The screen loads the full list and filters/sorts client-side, so this is a
 * plain array — but every opportunity must appear exactly once.
 */
export const earnOpportunityListSchema = z
  .array(earnOpportunityRowSchema)
  .superRefine((rows, ctx) => {
    const seen = new Set<string>();

    rows.forEach((row, index) => {
      if (seen.has(row.id)) {
        ctx.addIssue({
          code: "custom",
          message: "Duplicate opportunity ID in list",
          path: [index, "id"],
        });
        return;
      }

      seen.add(row.id);
    });
  }) satisfies z.ZodType<EarnOpportunityRow[]>;
