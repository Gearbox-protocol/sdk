// Public types

export type { EntityFactoryDeps, RawMarketInput } from "./factory.js";
// Entity factory
export { buildEntities } from "./factory.js";
export type {
  Market,
  MarketBase,
  MarketOffchainStrategy,
  MarketOnchainStrategy,
} from "./market.js";
export {
  MarketImpl,
  MarketOffchainStrategyImpl,
  MarketOnchainStrategyImpl,
} from "./market.js";
export type {
  Opportunity,
  OpportunityBase,
  PoolOpportunityData,
} from "./opportunity.js";
export { PoolOpportunityImpl } from "./opportunity.js";
export type {
  Pool,
  PoolBase,
  PoolOffchainStrategy,
  PoolOnchainStrategy,
} from "./pool.js";
// Strategy implementations
// Implementation classes (for internal wiring)
export {
  PoolImpl,
  PoolOffchainStrategyImpl,
  PoolOnchainStrategyImpl,
} from "./pool.js";
