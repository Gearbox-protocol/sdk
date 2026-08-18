import { describe, expectTypeOf, it } from "vitest";
import type { z } from "zod/v4";
import type {
  ChartBundle,
  ChartDenomination,
  ChartMetric,
  ChartQuery,
  ChartRange,
  ChartSeries,
  ChartValue,
  ChartWindow,
  POOL_CHART_METRICS,
  POOL_POSITION_CHART_METRICS,
  PoolChartMetric,
  PoolPositionChartMetric,
  STRATEGY_CHART_METRICS,
  STRATEGY_POSITION_CHART_METRICS,
  StrategyChartMetric,
  StrategyPositionChartMetric,
} from "./charts.js";
import type {
  chartDenominationSchema,
  chartMetricSchema,
  chartQuerySchema,
  chartRangeSchema,
  chartSeriesSchema,
  chartValueSchema,
  chartWindowSchema,
  poolChartMetricSchema,
  poolPositionChartMetricSchema,
  strategyChartMetricSchema,
  strategyPositionChartMetricSchema,
} from "./charts.schema.js";
import type { Curator, CuratorName } from "./curators.js";
import type { curatorNameSchema, curatorSchema } from "./curators.schema.js";
import type {
  DelayedReceivedAsset,
  InstantReceivedAsset,
  LiquidatableAccount,
  LiquidatableAccountFilter,
  LiquidationApproval,
  LiquidationDetails,
  LiquidationPosition,
  ReceivedAsset,
} from "./liquidations.js";
import type {
  delayedReceivedAssetSchema,
  instantReceivedAssetSchema,
  liquidatableAccountFilterSchema,
  liquidatableAccountSchema,
  liquidationApprovalSchema,
  liquidationDetailsSchema,
  liquidationPositionSchema,
  receivedAssetSchema,
} from "./liquidations.schema.js";
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
  opportunityFilterQuerySchema,
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
import type {
  PnlBreakdown,
  PointsProgramPnL,
  PointsRewardsPnL,
  PoolPosition,
  PoolPositionKey,
  Position,
  PositionCollateral,
  PositionFilter,
  PositionKey,
  PositionKind,
  RewardsPnL,
  StrategyPosition,
  StrategyPositionKey,
  TokenRewardsPnL,
} from "./positions.js";
import type {
  pnlBreakdownSchema,
  pointsProgramPnLSchema,
  pointsRewardsPnLSchema,
  poolPositionKeySchema,
  poolPositionSchema,
  positionCollateralSchema,
  positionFilterQuerySchema,
  positionFilterSchema,
  positionKeySchema,
  positionKindSchema,
  positionSchema,
  rewardsPnLSchema,
  strategyPositionKeySchema,
  strategyPositionSchema,
  tokenRewardsPnLSchema,
} from "./positions.schema.js";
import type {
  Amount,
  AssetType,
  Token,
  TokenAmount,
  TxCall,
} from "./primitives.js";
import type {
  amountSchema,
  assetTypeSchema,
  tokenAmountSchema,
  tokenSchema,
  txCallSchema,
} from "./primitives.schema.js";
import type {
  ChainFailed,
  ChainMetadata,
  ChainSucceeded,
  DataResponse,
  DataSource,
  ResponseMetadata,
} from "./response.js";
import type {
  chainFailedSchema,
  chainMetadataSchema,
  chainSucceededSchema,
  dataSourceSchema,
  responseMetadataSchema,
  responseSchema,
} from "./response.schema.js";

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
    expectTypeOf<
      z.infer<typeof tokenAmountSchema>
    >().toEqualTypeOf<TokenAmount>();
    expectTypeOf<z.infer<typeof txCallSchema>>().toEqualTypeOf<TxCall>();
  });

  it("bigints decode from either the wire or the chain", () => {
    // `z.infer` above is the decoded side; this pins the accepted side, so the
    // codec cannot be narrowed back to bigint-only without failing here. It is
    // deliberately wider than the backend's `Wire<T>`, whose `value` is only
    // ever the string: the wire form is a subset of what decode accepts, which
    // is what lets one schema validate both a JSON response and a value the
    // SDK built from the chain. For the same reason there is no whole-model
    // `Wire<T>` mirror here — `Wire<Address>` stays the template-literal
    // `Address` where a codec input is a plain `string`.
    expectTypeOf<z.input<typeof amountSchema>>().toEqualTypeOf<{
      value: string | bigint;
      valueUsd: number | null;
    }>();
    expectTypeOf<z.input<typeof txCallSchema>["value"]>().toEqualTypeOf<
      string | bigint | undefined
    >();
  });

  it("curators", () => {
    expectTypeOf<
      z.infer<typeof curatorNameSchema>
    >().toEqualTypeOf<CuratorName>();
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
    expectTypeOf<
      z.infer<typeof opportunityFilterQuerySchema>
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

  it("charts", () => {
    expectTypeOf<
      z.infer<typeof chartRangeSchema>
    >().toEqualTypeOf<ChartRange>();
    expectTypeOf<
      z.infer<typeof poolChartMetricSchema>
    >().toEqualTypeOf<PoolChartMetric>();
    expectTypeOf<
      z.infer<typeof strategyChartMetricSchema>
    >().toEqualTypeOf<StrategyChartMetric>();
    expectTypeOf<
      z.infer<typeof poolPositionChartMetricSchema>
    >().toEqualTypeOf<PoolPositionChartMetric>();
    expectTypeOf<
      z.infer<typeof strategyPositionChartMetricSchema>
    >().toEqualTypeOf<StrategyPositionChartMetric>();
    expectTypeOf<
      z.infer<typeof chartMetricSchema>
    >().toEqualTypeOf<ChartMetric>();
    expectTypeOf<
      z.infer<typeof chartDenominationSchema>
    >().toEqualTypeOf<ChartDenomination>();
    expectTypeOf<
      z.infer<typeof chartValueSchema>
    >().toEqualTypeOf<ChartValue>();
    expectTypeOf<
      z.infer<typeof chartSeriesSchema>
    >().toEqualTypeOf<ChartSeries>();
    expectTypeOf<
      z.infer<typeof chartWindowSchema>
    >().toEqualTypeOf<ChartWindow>();
    expectTypeOf<
      z.infer<typeof chartQuerySchema>
    >().toEqualTypeOf<ChartQuery>();
  });

  it("a bundle keyed by more metrics answers for fewer", () => {
    // keying the series by metric decides the variance: a bundle carrying both
    // satisfies a consumer that needs one of them, while a one-metric bundle is
    // not a two-metric one
    expectTypeOf<ChartBundle<readonly ["depositApy", "supplied"]>>().toExtend<
      ChartBundle<readonly ["depositApy"]>
    >();
  });

  it("liquidations", () => {
    expectTypeOf<
      z.infer<typeof liquidatableAccountFilterSchema>
    >().toEqualTypeOf<LiquidatableAccountFilter>();
    expectTypeOf<
      z.infer<typeof liquidatableAccountSchema>
    >().toEqualTypeOf<LiquidatableAccount>();
    expectTypeOf<
      z.infer<typeof instantReceivedAssetSchema>
    >().toEqualTypeOf<InstantReceivedAsset>();
    expectTypeOf<
      z.infer<typeof delayedReceivedAssetSchema>
    >().toEqualTypeOf<DelayedReceivedAsset>();
    expectTypeOf<
      z.infer<typeof receivedAssetSchema>
    >().toEqualTypeOf<ReceivedAsset>();
    expectTypeOf<
      z.infer<typeof liquidationApprovalSchema>
    >().toEqualTypeOf<LiquidationApproval>();
    expectTypeOf<
      z.infer<typeof liquidationPositionSchema>
    >().toEqualTypeOf<LiquidationPosition>();
    expectTypeOf<
      z.infer<typeof liquidationDetailsSchema>
    >().toEqualTypeOf<LiquidationDetails>();
  });

  it("positions", () => {
    expectTypeOf<
      z.infer<typeof positionKindSchema>
    >().toEqualTypeOf<PositionKind>();
    expectTypeOf<
      z.infer<typeof tokenRewardsPnLSchema>
    >().toEqualTypeOf<TokenRewardsPnL>();
    expectTypeOf<
      z.infer<typeof pointsProgramPnLSchema>
    >().toEqualTypeOf<PointsProgramPnL>();
    expectTypeOf<
      z.infer<typeof pointsRewardsPnLSchema>
    >().toEqualTypeOf<PointsRewardsPnL>();
    expectTypeOf<
      z.infer<typeof rewardsPnLSchema>
    >().toEqualTypeOf<RewardsPnL>();
    expectTypeOf<
      z.infer<typeof pnlBreakdownSchema>
    >().toEqualTypeOf<PnlBreakdown>();
    expectTypeOf<
      z.infer<typeof positionCollateralSchema>
    >().toEqualTypeOf<PositionCollateral>();
    expectTypeOf<
      z.infer<typeof poolPositionSchema>
    >().toEqualTypeOf<PoolPosition>();
    expectTypeOf<
      z.infer<typeof strategyPositionSchema>
    >().toEqualTypeOf<StrategyPosition>();
    expectTypeOf<z.infer<typeof positionSchema>>().toEqualTypeOf<Position>();
    expectTypeOf<
      z.infer<typeof positionFilterSchema>
    >().toEqualTypeOf<PositionFilter>();
    expectTypeOf<
      z.infer<typeof positionFilterQuerySchema>
    >().toEqualTypeOf<PositionFilter>();
    expectTypeOf<
      z.infer<typeof poolPositionKeySchema>
    >().toEqualTypeOf<PoolPositionKey>();
    expectTypeOf<
      z.infer<typeof strategyPositionKeySchema>
    >().toEqualTypeOf<StrategyPositionKey>();
    expectTypeOf<
      z.infer<typeof positionKeySchema>
    >().toEqualTypeOf<PositionKey>();
  });

  it("response envelope", () => {
    expectTypeOf<
      z.infer<typeof dataSourceSchema>
    >().toEqualTypeOf<DataSource>();
    expectTypeOf<
      z.infer<typeof chainSucceededSchema>
    >().toEqualTypeOf<ChainSucceeded>();
    expectTypeOf<
      z.infer<typeof chainFailedSchema>
    >().toEqualTypeOf<ChainFailed>();
    expectTypeOf<
      z.infer<typeof chainMetadataSchema>
    >().toEqualTypeOf<ChainMetadata>();
    expectTypeOf<
      z.infer<typeof responseMetadataSchema>
    >().toEqualTypeOf<ResponseMetadata>();
    expectTypeOf<
      z.infer<ReturnType<typeof responseSchema<typeof tokenSchema>>>
    >().toEqualTypeOf<DataResponse<Token>>();
  });

  it("metric lists enumerate their union exhaustively", () => {
    // the lists are what generate one method per metric, so a metric missing
    // from one of them is a silently missing method rather than a type error
    expectTypeOf<
      (typeof POOL_CHART_METRICS)[number]
    >().toEqualTypeOf<PoolChartMetric>();
    expectTypeOf<
      (typeof STRATEGY_CHART_METRICS)[number]
    >().toEqualTypeOf<StrategyChartMetric>();
    expectTypeOf<
      (typeof POOL_POSITION_CHART_METRICS)[number]
    >().toEqualTypeOf<PoolPositionChartMetric>();
    expectTypeOf<
      (typeof STRATEGY_POSITION_CHART_METRICS)[number]
    >().toEqualTypeOf<StrategyPositionChartMetric>();
  });
});
