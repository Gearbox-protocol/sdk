import { describe, expectTypeOf, it } from "vitest";
import type { z } from "zod/v4";
import type {
  HistoryMetric,
  HistoryPoint,
  HistoryRange,
  HistorySeries,
  OpportunityHistoryQuery,
  POOL_HISTORY_METRICS,
  PoolHistoryMetric,
  STRATEGY_HISTORY_METRICS,
  StrategyHistoryMetric,
} from "./history.js";
import type {
  historyMetricSchema,
  historyPointSchema,
  historyRangeSchema,
  historySeriesSchema,
  opportunityHistoryQuerySchema,
  poolHistoryMetricSchema,
  strategyHistoryMetricSchema,
} from "./history.schema.js";
import type {
  ApyBreakdown,
  Opportunity,
  OpportunityBase,
  OpportunityDetail,
  OpportunityFilter,
  OpportunityKey,
  OpportunityKind,
  PointRewards,
  PointsProgram,
  PoolOpportunity,
  PoolOpportunityDetail,
  PoolOpportunityKey,
  PriceFeedData,
  PriceFeedSummary,
  QuotaAsset,
  RateCurve,
  RateCurvePoint,
  Rewards,
  StrategyOpportunity,
  StrategyOpportunityDetail,
  StrategyOpportunityKey,
  TokenRewards,
} from "./opportunities.js";
import type {
  apyBreakdownSchema,
  opportunityBaseSchema,
  opportunityDetailSchema,
  opportunityFilterSchema,
  opportunityKeySchema,
  opportunityKindSchema,
  opportunitySchema,
  pointRewardsSchema,
  pointsProgramSchema,
  poolOpportunityDetailSchema,
  poolOpportunityKeySchema,
  poolOpportunitySchema,
  priceFeedDataSchema,
  priceFeedSummarySchema,
  quotaAssetSchema,
  rateCurvePointSchema,
  rateCurveSchema,
  rewardsSchema,
  strategyOpportunityDetailSchema,
  strategyOpportunityKeySchema,
  strategyOpportunitySchema,
  tokenRewardsSchema,
} from "./opportunities.schema.js";
import type { Amount, AssetType, Curator, Token } from "./primitives.js";
import type {
  amountSchema,
  assetTypeSchema,
  curatorSchema,
  tokenSchema,
} from "./primitives.schema.js";

/**
 * The read model is a contract shared with a separately deployed backend: the
 * hand-written types are what consumers program against, the zod schemas are
 * what the offchain client validates responses with. Nothing generates one
 * from the other, so these assertions are what keeps them from drifting.
 *
 * The direction matters in both ways: a schema that accepts more than the type
 * lets malformed data through, and a schema that accepts less rejects valid
 * backend responses.
 **/

describe("model schemas match model types", () => {
  it("primitives", () => {
    expectTypeOf<z.infer<typeof amountSchema>>().toEqualTypeOf<Amount>();
    expectTypeOf<z.infer<typeof assetTypeSchema>>().toEqualTypeOf<AssetType>();
    expectTypeOf<z.infer<typeof tokenSchema>>().toEqualTypeOf<Token>();
    expectTypeOf<z.infer<typeof curatorSchema>>().toEqualTypeOf<Curator>();
  });

  it("rewards and apy", () => {
    expectTypeOf<
      z.infer<typeof pointsProgramSchema>
    >().toEqualTypeOf<PointsProgram>();
    expectTypeOf<
      z.infer<typeof tokenRewardsSchema>
    >().toEqualTypeOf<TokenRewards>();
    expectTypeOf<
      z.infer<typeof pointRewardsSchema>
    >().toEqualTypeOf<PointRewards>();
    expectTypeOf<z.infer<typeof rewardsSchema>>().toEqualTypeOf<Rewards>();
    expectTypeOf<
      z.infer<typeof apyBreakdownSchema>
    >().toEqualTypeOf<ApyBreakdown>();
  });

  it("opportunity rows", () => {
    expectTypeOf<
      z.infer<typeof opportunityKindSchema>
    >().toEqualTypeOf<OpportunityKind>();
    expectTypeOf<
      z.infer<typeof opportunityBaseSchema>
    >().toEqualTypeOf<OpportunityBase>();
    expectTypeOf<
      z.infer<typeof poolOpportunitySchema>
    >().toEqualTypeOf<PoolOpportunity>();
    expectTypeOf<
      z.infer<typeof strategyOpportunitySchema>
    >().toEqualTypeOf<StrategyOpportunity>();
    expectTypeOf<
      z.infer<typeof opportunitySchema>
    >().toEqualTypeOf<Opportunity>();
    expectTypeOf<
      z.infer<typeof opportunityFilterSchema>
    >().toEqualTypeOf<OpportunityFilter>();
  });

  it("detail groups", () => {
    expectTypeOf<
      z.infer<typeof rateCurvePointSchema>
    >().toEqualTypeOf<RateCurvePoint>();
    expectTypeOf<z.infer<typeof rateCurveSchema>>().toEqualTypeOf<RateCurve>();
    expectTypeOf<
      z.infer<typeof quotaAssetSchema>
    >().toEqualTypeOf<QuotaAsset>();
    expectTypeOf<
      z.infer<typeof priceFeedDataSchema>
    >().toEqualTypeOf<PriceFeedData>();
    expectTypeOf<
      z.infer<typeof priceFeedSummarySchema>
    >().toEqualTypeOf<PriceFeedSummary>();
    expectTypeOf<
      z.infer<typeof poolOpportunityDetailSchema>
    >().toEqualTypeOf<PoolOpportunityDetail>();
    expectTypeOf<
      z.infer<typeof strategyOpportunityDetailSchema>
    >().toEqualTypeOf<StrategyOpportunityDetail>();
    expectTypeOf<
      z.infer<typeof opportunityDetailSchema>
    >().toEqualTypeOf<OpportunityDetail>();
  });

  it("detail request keys", () => {
    expectTypeOf<
      z.infer<typeof poolOpportunityKeySchema>
    >().toEqualTypeOf<PoolOpportunityKey>();
    expectTypeOf<
      z.infer<typeof strategyOpportunityKeySchema>
    >().toEqualTypeOf<StrategyOpportunityKey>();
    expectTypeOf<
      z.infer<typeof opportunityKeySchema>
    >().toEqualTypeOf<OpportunityKey>();
  });

  it("history", () => {
    expectTypeOf<
      z.infer<typeof historyRangeSchema>
    >().toEqualTypeOf<HistoryRange>();
    expectTypeOf<
      z.infer<typeof poolHistoryMetricSchema>
    >().toEqualTypeOf<PoolHistoryMetric>();
    expectTypeOf<
      z.infer<typeof strategyHistoryMetricSchema>
    >().toEqualTypeOf<StrategyHistoryMetric>();
    expectTypeOf<
      z.infer<typeof historyMetricSchema>
    >().toEqualTypeOf<HistoryMetric>();
    expectTypeOf<
      z.infer<typeof historyPointSchema>
    >().toEqualTypeOf<HistoryPoint>();
    expectTypeOf<
      z.infer<typeof historySeriesSchema>
    >().toEqualTypeOf<HistorySeries>();
    expectTypeOf<
      z.infer<typeof opportunityHistoryQuerySchema>
    >().toEqualTypeOf<OpportunityHistoryQuery>();
  });

  it("metric lists enumerate their union exhaustively", () => {
    // the lists are what generate one method per metric, so a metric missing
    // from one of them is a silently missing method rather than a type error
    expectTypeOf<
      (typeof POOL_HISTORY_METRICS)[number]
    >().toEqualTypeOf<PoolHistoryMetric>();
    expectTypeOf<
      (typeof STRATEGY_HISTORY_METRICS)[number]
    >().toEqualTypeOf<StrategyHistoryMetric>();
  });
});
