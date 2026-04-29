/**
 * Entity factory: builds all entity instances from merged data source inputs.
 */
import type { Address, NetworkType } from "../core/index.js";
import type {
  MarketOffchainStrategy,
  MarketOnchainStrategy,
} from "./market.js";
import { MarketImpl } from "./market.js";
import { PoolOpportunityImpl } from "./opportunity.js";
import type { PoolOffchainStrategy, PoolOnchainStrategy } from "./pool.js";
import { PoolImpl } from "./pool.js";

export interface EntityFactoryDeps {
  poolOnchain: PoolOnchainStrategy | null;
  poolOffchain: PoolOffchainStrategy | null;
  marketOnchain: MarketOnchainStrategy | null;
  marketOffchain: MarketOffchainStrategy | null;
}

export interface RawMarketInput {
  network: NetworkType;
  chainId: number;
  configurator: Address;
  poolAddress: Address;
  underlying: Address;
  availableLiquidity: bigint;
}

export function buildEntities(
  inputs: RawMarketInput[],
  deps: EntityFactoryDeps,
): {
  pools: PoolImpl[];
  markets: MarketImpl[];
  opportunities: PoolOpportunityImpl[];
} {
  const pools: PoolImpl[] = [];
  const markets: MarketImpl[] = [];
  const opportunities: PoolOpportunityImpl[] = [];

  for (const input of inputs) {
    const pool = new PoolImpl(
      {
        address: input.poolAddress,
        network: input.network,
        chainId: input.chainId,
        underlying: input.underlying,
        availableLiquidity: input.availableLiquidity,
      },
      deps.poolOnchain,
      deps.poolOffchain,
    );
    pools.push(pool);

    const market = new MarketImpl(
      {
        configurator: input.configurator,
        network: input.network,
        chainId: input.chainId,
      },
      pool,
      deps.marketOnchain,
      deps.marketOffchain,
    );
    markets.push(market);

    if (deps.poolOnchain && deps.poolOffchain) {
      opportunities.push(new PoolOpportunityImpl(pool, deps.poolOnchain));
    }
  }

  return { pools, markets, opportunities };
}
