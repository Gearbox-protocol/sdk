import type { Address } from "viem";
import type {
  Amount,
  Opportunity,
  OpportunityFilter,
  PoolOpportunityDetail,
  PoolOpportunityKey,
  StrategyOpportunityDetail,
  StrategyOpportunityKey,
} from "../../model/index.js";
import { SDKConstruct } from "../base/index.js";
import type { MarketSuite, StrategyTotalsLookup } from "../market/index.js";
import { usdToNumber } from "../market/math.js";

/**
 * A lookup that knows of no strategy, used when a filter rules strategies out
 * and the credit-account query is skipped altogether.
 **/
const NO_TOTALS: StrategyTotalsLookup = () => undefined;

/**
 * Builds the `opportunities` read model from the chain.
 *
 * Everything except the credit-account totals comes from the market state the
 * SDK already holds, so a list costs one RPC round-trip at most. Yield figures
 * that fold in incentives, points or history are deliberately absent: they are
 * the backend's job, and this service never guesses them.
 *
 * The rows themselves are assembled by the market wrappers — see
 * {@link MarketSuite.opportunities} — because every value in them is market
 * state. What is left here is the one thing no single market can answer: how
 * much the credit accounts of a strategy are worth.
 **/
export class OpportunitiesService extends SDKConstruct {
  /**
   * Every pool and strategy of every loaded market on this chain.
   *
   * Strategies are measured by the value locked in their credit accounts, so
   * the list issues one credit-account query unless the filter rules strategies
   * out entirely.
   *
   * @param filter - Optional narrowing, applied to the built rows.
   **/
  public async list(filter?: OpportunityFilter): Promise<Opportunity[]> {
    if (filter?.chainIds && !filter.chainIds.includes(this.chainId)) {
      return [];
    }

    const { markets } = this.sdk.marketRegister;
    const totals =
      filter?.kind === "pool" ? NO_TOTALS : await this.#strategyTotals(markets);

    return markets.flatMap(market => market.opportunities(totals, filter));
  }

  /**
   * A single pool opportunity plus its interest rate curve and quotas.
   *
   * @throws If no loaded market has this pool.
   **/
  public async getPool(
    key: PoolOpportunityKey,
  ): Promise<PoolOpportunityDetail> {
    return this.sdk.marketRegister.findByPool(key.pool).poolOpportunityDetail();
  }

  /**
   * A single strategy opportunity plus the rate curve of the pool it borrows
   * from and the price feeds its liquidation price depends on.
   *
   * @throws If the credit manager is unknown, or does not accept the requested
   * collateral as a strategy.
   **/
  public async getStrategy(
    key: StrategyOpportunityKey,
  ): Promise<StrategyOpportunityDetail> {
    const market = this.sdk.marketRegister.findByCreditManager(
      key.creditManager,
    );
    // rejects an unknown key before the credit-account query rather than after
    const { suite } = market.mustFindStrategy(
      key.creditManager,
      key.targetCollateral,
    );

    const totals = await this.#strategyTotals([market]);
    return suite.strategyOpportunityDetail(
      key.targetCollateral,
      totals(key.creditManager, key.targetCollateral),
    );
  }

  /**
   * Total value held by the credit accounts backing every strategy of the given
   * markets.
   *
   * An account that holds several strategy collaterals counts in full towards
   * each of them: the read model reports what a strategy's accounts are worth,
   * not how that worth splits across the collaterals inside them.
   **/
  async #strategyTotals(markets: MarketSuite[]): Promise<StrategyTotalsLookup> {
    const wanted = new Map<string, Set<string>>();
    for (const market of markets) {
      for (const { suite, collateral } of market.strategies) {
        const cm = suite.creditManager.address.toLowerCase();
        const tokens = wanted.get(cm) ?? new Set<string>();
        tokens.add(collateral.toLowerCase());
        wanted.set(cm, tokens);
      }
    }
    if (wanted.size === 0) {
      return NO_TOTALS;
    }

    const accounts = await this.sdk.accounts.getCreditAccounts({
      includeZeroDebt: true,
    });

    const totals = new Map<string, Amount>();
    for (const account of accounts) {
      const tokens = wanted.get(account.creditManager.toLowerCase());
      if (!tokens) {
        continue;
      }
      for (const token of account.tokens) {
        if (token.balance <= 0n || !tokens.has(token.token.toLowerCase())) {
          continue;
        }
        const key = strategyKey(account.creditManager, token.token);
        const current = totals.get(key);
        totals.set(key, {
          value: (current?.value ?? 0n) + account.totalValue,
          valueUsd:
            (current?.valueUsd ?? 0) + usdToNumber(account.totalValueUSD),
        });
      }
    }

    return (creditManager, collateral) =>
      totals.get(strategyKey(creditManager, collateral));
  }
}

/**
 * Both halves of a strategy key folded into one map key.
 **/
function strategyKey(creditManager: Address, collateral: Address): string {
  return `${creditManager.toLowerCase()}:${collateral.toLowerCase()}`;
}
