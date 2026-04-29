import type { Address } from "viem";
import type { NetworkType } from "../../sdk/index.js";
import type { MarketSuite } from "../../sdk/market/index.js";
import type { Mode } from "../core/index.js";
import type { Curator } from "../curator/Curator.js";
import type {
  OpportunityCollection,
  PoolOpportunityCollection,
  StrategyOpportunityCollection,
} from "../opportunity/index.js";
import type { TokenType } from "../tokens/index.js";
import type { MarketCollectionType } from "./MarketCollection.js";

export type OnchainMarketData = MarketSuite;
// biome-ignore lint/complexity/noBannedTypes: placeholder until offchain market mocks are introduced
export type OffchainMarketData = {};

export interface CommonMarketCaps {
  readonly chainId: number;
  readonly network: NetworkType;
  readonly poolAddress: Address;
  readonly underlying: TokenType<Mode>;
}

export interface OnchainMarketCaps {
  readonly marketConfigurator: Address;
  readonly curator: Curator;
  readonly lossPolicy: string;

  readonly totalSupply: bigint;
  readonly availableLiquidity: bigint;
  readonly expectedLiquidity: bigint;
  readonly baseInterestRate: bigint;
  readonly supplyRate: bigint;
  readonly withdrawFee: bigint;
  readonly totalBorrowed: bigint;
  readonly totalDebtLimit: bigint;
}

export interface OffchainMarketCaps<M extends Mode = Mode> {
  readonly opportunities: OpportunityCollection<M>;
  readonly poolOpportunities: PoolOpportunityCollection<M>;
  readonly strategyOpportunities: StrategyOpportunityCollection<M>;
}

export interface OnchainMarketCollectionCaps<M extends Mode> {
  withCollaterals(...tokens: Array<string | Address>): MarketCollectionType<M>;
}

export interface OffchainMarketCollectionCaps<M extends Mode> {
  readonly opportunities: OpportunityCollection<M>;
  readonly poolOpportunities: PoolOpportunityCollection<M>;
  readonly strategyOpportunities: StrategyOpportunityCollection<M>;
}
