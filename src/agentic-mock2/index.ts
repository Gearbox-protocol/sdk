// Core types
export type {
  Address,
  Caps,
  Hex,
  IfBothModes,
  IfOffchain,
  Mode,
  ModeCapabilities,
  NetworkType,
  RawTx,
  SDKContext,
  TvlChartData,
  TvlChartPoint,
} from "./core/index.js";

// Entity types and classes
export type {
  MarketBase,
  MarketType,
  OffchainMarketOps,
  OffchainOpportunityOps,
  OnchainMarketOps,
  OnchainOpportunityOps,
  Opportunity,
  OpportunityBase,
} from "./entities/index.js";
export {
  Curator,
  Market,
  PoolOpportunity,
  StrategyOpportunity,
} from "./entities/index.js";

// SDK
export type { GearboxSDK, GearboxSDKConfig } from "./gearbox-sdk.js";
export { createGearboxSDK } from "./gearbox-sdk.js";

// Namespace types
export type {
  CuratorFilter,
  CuratorsNamespace,
  MarketFilter,
  MarketsNamespace,
  OpportunitiesNamespace,
  OpportunityFilter,
} from "./namespaces/index.js";
