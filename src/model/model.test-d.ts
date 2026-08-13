import { describe, expectTypeOf, it } from "vitest";
import type { z } from "zod/v4";
import type { Curator, CuratorName } from "./curators.js";
import type { curatorNameSchema, curatorSchema } from "./curators.schema.js";
import type {
  HistoryMetric,
  HistoryPoint,
  HistoryRange,
  HistorySeries,
  OpportunityHistoryQuery,
  POOL_HISTORY_METRICS,
  POOL_POSITION_HISTORY_METRICS,
  PoolHistoryMetric,
  PoolPositionHistoryMetric,
  PositionHistoryMetric,
  PositionHistoryQuery,
  STRATEGY_HISTORY_METRICS,
  STRATEGY_POSITION_HISTORY_METRICS,
  StrategyHistoryMetric,
  StrategyPositionHistoryMetric,
} from "./history.js";
import type {
  historyMetricSchema,
  historyPointSchema,
  historyRangeSchema,
  historySeriesSchema,
  opportunityHistoryQuerySchema,
  poolHistoryMetricSchema,
  poolPositionHistoryMetricSchema,
  positionHistoryMetricSchema,
  positionHistoryQuerySchema,
  strategyHistoryMetricSchema,
  strategyPositionHistoryMetricSchema,
} from "./history.schema.js";
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

  it("position history", () => {
    expectTypeOf<
      z.infer<typeof poolPositionHistoryMetricSchema>
    >().toEqualTypeOf<PoolPositionHistoryMetric>();
    expectTypeOf<
      z.infer<typeof strategyPositionHistoryMetricSchema>
    >().toEqualTypeOf<StrategyPositionHistoryMetric>();
    expectTypeOf<
      z.infer<typeof positionHistoryMetricSchema>
    >().toEqualTypeOf<PositionHistoryMetric>();
    expectTypeOf<
      z.infer<typeof positionHistoryQuerySchema>
    >().toEqualTypeOf<PositionHistoryQuery>();
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
      z.infer<typeof poolPositionKeySchema>
    >().toEqualTypeOf<PoolPositionKey>();
    expectTypeOf<
      z.infer<typeof strategyPositionKeySchema>
    >().toEqualTypeOf<StrategyPositionKey>();
    expectTypeOf<
      z.infer<typeof positionKeySchema>
    >().toEqualTypeOf<PositionKey>();
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
    expectTypeOf<
      (typeof POOL_POSITION_HISTORY_METRICS)[number]
    >().toEqualTypeOf<PoolPositionHistoryMetric>();
    expectTypeOf<
      (typeof STRATEGY_POSITION_HISTORY_METRICS)[number]
    >().toEqualTypeOf<StrategyPositionHistoryMetric>();
  });
});
