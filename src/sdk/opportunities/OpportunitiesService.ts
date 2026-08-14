import type {
  Opportunity,
  OpportunityFilter,
  PoolOpportunityDetail,
  PoolOpportunityKey,
  StrategyOpportunityDetail,
  StrategyOpportunityKey,
} from "../../model/index.js";
import { isFilterSet } from "../../model/index.js";
import { SDKConstruct } from "../base/index.js";

/**
 * Builds the `opportunities` read model from the chain.
 *
 * Every value in a row is market state the SDK already holds, so a list costs
 * no RPC round-trip at all. Yield figures that fold in incentives, points or
 * history are deliberately absent: they are the backend's job, and this service
 * never guesses them. So is the size of a strategy — summing it takes a sweep
 * over every credit account of the chain, which is too expensive for a list.
 *
 * The rows themselves are assembled by the market wrappers — see
 * {@link MarketSuite.opportunities} — because every value in them is market
 * state. This service only picks the markets and applies the filter.
 **/
export class OpportunitiesService extends SDKConstruct {
  /**s
   * Every pool and strategy of every loaded market on this chain.
   *
   * @param filter - Optional narrowing, applied to the built rows.
   **/
  public list(filter?: OpportunityFilter): Opportunity[] {
    const chainIds = filter?.chainIds;
    if (isFilterSet(chainIds) && !chainIds.includes(this.chainId)) {
      return [];
    }

    return this.sdk.marketRegister.markets.flatMap(market =>
      market.opportunities(filter),
    );
  }

  /**
   * A single pool opportunity plus its interest rate curve and quotas.
   *
   * @throws If no loaded market has this pool.
   **/
  public getPool(key: PoolOpportunityKey): PoolOpportunityDetail {
    return this.sdk.marketRegister.findByPool(key.pool).poolOpportunityDetail();
  }

  /**
   * A single strategy opportunity plus the rate curve of the pool it borrows
   * from and the price feeds its liquidation price depends on.
   *
   * @throws If the credit manager is unknown, or does not accept the requested
   * collateral as a strategy.
   **/
  public getStrategy(key: StrategyOpportunityKey): StrategyOpportunityDetail {
    return this.sdk.marketRegister
      .findByCreditManager(key.creditManager)
      .strategyOpportunityDetail(key.creditManager, key.targetCollateral);
  }
}
