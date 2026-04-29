import type { Mode } from "../core/mode.js";
import type { RawTx, TvlChartData } from "../core/types.js";
import type { Curator } from "../curator/entity.js";
import type {
  Opportunity,
  OpportunityCollection,
} from "../opportunity/index.js";

export interface OnchainMarketOps {
  readonly kycRequired: boolean;
  readonly availableLiquidity: bigint;
  createDepositTx(amount: bigint): RawTx;
}

export interface OffchainMarketOps {
  readonly supplyApy: number;
  readonly description: string;
  loadHistoricalTvl(from: number, to: number): Promise<TvlChartData>;
  readonly opportunities: Opportunity<Mode>[];
  readonly curator: Curator | undefined;
}

export interface OffchainMarketCollectionOps<M extends Mode> {
  readonly opportunities: OpportunityCollection<M>;
}
