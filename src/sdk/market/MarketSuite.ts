import { type Address, isAddressEqual } from "viem";

import type {
  Curator,
  Opportunity,
  OpportunityFilter,
  PoolOpportunity,
  PoolOpportunityDetail,
  PriceFeedSummary,
  QuotaAsset,
  StrategyOpportunityDetail,
  Token,
} from "../../model/index.js";
import { matchesOpportunityFilter } from "../../model/index.js";
import type { MarketData } from "../base/index.js";
import { SDKConstruct } from "../base/index.js";
import { isRWAToken, isSunsetPool } from "../chain/chains.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import type { MarketStateHuman } from "../types/index.js";
import { AddressMap } from "../utils/index.js";
import { CreditSuite } from "./credit/index.js";
import {
  createLossPolicy,
  type ILossPolicyContract,
} from "./loss-policy/index.js";
import { MarketConfiguratorContract } from "./MarketConfiguratorContract.js";
import { rayToBps } from "./math.js";
import type { IPriceOracleContract } from "./oracle/index.js";
import { createPriceOracle } from "./oracle/index.js";
import { PoolSuite } from "./pool/index.js";
import type { IRWAFactory } from "./rwa/types.js";

/**
 * One `(credit suite, target collateral)` pair that qualifies as a leveraged
 * position.
 */
export interface StrategyRef {
  suite: CreditSuite;
  collateral: Address;
}

/**
 * Aggregates all SDK wrappers that make up one Gearbox market.
 *
 * @remarks
 * A market is the SDK representation of the core "one pool, many markets"
 * architecture: one liquidity pool can fund several isolated credit suites,
 * while the market-level configurator, price oracle, and loss policy define
 * the shared risk boundary.
 */
export class MarketSuite extends SDKConstruct {
  /**
   * Access-control list contract that owns market roles such as pausable and
   * unpausable admins.
   */
  public readonly acl: Address;
  /**
   * Treasury splitter or fee recipient associated with this market.
   */
  public readonly treasury: Address;
  /**
   * Market-level configurator that controls pool and credit-suite risk
   * parameters.
   */
  public readonly configurator: MarketConfiguratorContract;
  /**
   * Pool-side contract bundle: ERC-4626 pool, quota keeper, rate keeper, and
   * interest-rate model.
   */
  public readonly pool: PoolSuite;
  /**
   * Market price oracle used by credit managers and pool for normalized
   * price conversion and safe-price checks.
   */
  public readonly priceOracle: IPriceOracleContract;
  /**
   * Bad-debt liquidation policy shared by the market's credit facades.
   */
  public readonly lossPolicy: ILossPolicyContract;
  /**
   * Credit-suite wrappers connected to the pool.
   *
   * @remarks
   * Each suite corresponds to one credit manager branch with its own facade,
   * configurator, collateral set, adapters, debt limits, and expiration policy.
   */
  public readonly creditManagers: CreditSuite[] = [];
  /**
   * Original market snapshot received from the market compressor contract.
   */
  public readonly state: MarketData;

  /**
   * Creates a market aggregate from compressor state.
   *
   * @param sdk - Attached on-chain SDK instance used for contract lookup,
   * labels, token metadata, and plugin access.
   * @param marketData - Full market state returned by the market compressor.
   * @throws If the configurator address from `marketData` is not already
   * registered as a {@link MarketConfiguratorContract}.
   */
  constructor(sdk: OnchainSDK, marketData: MarketData) {
    super(sdk);
    this.state = marketData;

    // must be already created in MarketRegister
    const mc = sdk.mustGetContract(marketData.configurator);
    if (!(mc instanceof MarketConfiguratorContract)) {
      throw new Error(
        `Market configurator ${marketData.configurator} is not a market configurator`,
      );
    }
    this.configurator = mc;

    this.acl = marketData.acl;
    this.treasury = marketData.treasury;

    for (const t of marketData.tokens) {
      sdk.tokensMeta.upsert(t.addr, t);
      sdk.setAddressLabel(t.addr, t.symbol);
    }

    this.pool = new PoolSuite(sdk, marketData);

    for (const suiteData of marketData.creditManagers) {
      this.creditManagers.push(new CreditSuite(sdk, suiteData));
    }

    this.priceOracle = createPriceOracle(sdk, marketData.priceOracle);
    this.lossPolicy = createLossPolicy(sdk, marketData.lossPolicy);
  }

  /**
   * Underlying token of the market pool.
   */
  public get underlying(): Address {
    return this.pool.underlying;
  }

  /**
   * Factory contract that opens and manages RWA-compliant credit accounts for
   * this market. Defined only for RWA markets.
   */
  public get rwaFactory(): IRWAFactory | undefined {
    return this.pool.rwaFactory;
  }

  /**
   * {@inheritDoc IPoolContract.unwrappedUnderlying}
   */
  public get unwrappedUnderlying(): Address {
    return this.pool.unwrappedUnderlying;
  }

  /**
   * The market's underlying as the shared read model describes it.
   *
   * For an RWA market this is the token the underlying wraps rather than the
   * wrapper itself, because only that token means anything to a reader. The
   * wrapper converts one-for-one, so amounts denominated in it stay exact.
   */
  public get underlyingToken(): Token {
    return this.tokensMeta.mustGetToken(this.unwrappedUnderlying);
  }

  /**
   * Display name of this market's pool, e.g. `"USDC Pool"`.
   */
  public get poolName(): string {
    return `${this.underlyingToken.symbol} Pool`;
  }

  /**
   * {@inheritDoc MarketConfiguratorContract.curator}
   */
  public get curator(): Curator {
    return this.configurator.curator;
  }

  /**
   * Every `(credit suite, collateral)` pair of this market that qualifies as a
   * leveraged position.
   */
  public get strategies(): StrategyRef[] {
    return this.creditManagers.flatMap(suite =>
      suite.strategyCollaterals.map(collateral => ({ suite, collateral })),
    );
  }

  /**
   * Tokens a position can actually be built on in this market, deduplicated
   * across its credit suites.
   */
  public get collateralTokens(): Token[] {
    const seen = new AddressMap<Token>(undefined, "collateralTokens");
    for (const { collateral } of this.strategies) {
      seen.upsert(collateral, this.tokensMeta.mustGetToken(collateral));
    }
    return seen.values();
  }

  /**
   * Whether at least one of {@link collateralTokens} is a real-world-asset
   * token. Read from a hardcoded per-chain list rather than from the chain.
   */
  public get rwa(): boolean {
    return this.strategies.some(({ collateral }) =>
      isRWAToken(collateral, this.sdk.networkType),
    );
  }

  /**
   * Whether this market's pool is being wound down and should no longer be
   * entered. Read from a hardcoded per-chain list.
   */
  public get sunset(): boolean {
    return isSunsetPool(this.pool.pool.address, this.sdk.networkType);
  }

  /**
   * Quota configuration of every token the market quotes: how much of it the
   * market accepts in total, and what holding it costs.
   */
  public quotaAssets(): QuotaAsset[] {
    const oracle = this.priceOracle;
    const { underlying } = this;

    return this.pool.pqk.quotas.entries().map(([token, quota]) => ({
      token: this.tokensMeta.mustGetToken(token),
      quotaRate: quota.rate,
      // quota limits are denominated in the market's underlying, not in the
      // quoted token itself
      limit: oracle.toAmount(underlying, quota.limit),
      used: oracle.toAmount(underlying, quota.totalQuoted),
    }));
  }

  /**
   * Prices and feeds of a collateral token and the market's underlying.
   *
   * Pricing goes through the wrapper for an RWA market, since that is what the
   * market's oracle knows.
   *
   * @param collateral - Collateral token to price.
   */
  public priceFeedSummary(collateral: Address): PriceFeedSummary {
    return this.priceOracle.priceFeedSummary(this.underlying, collateral);
  }

  /**
   * Every opportunity this market offers: its pool, plus one row per
   * `(credit manager, target collateral)` pair.
   *
   * @param filter - Optional narrowing. A filter naming a kind skips building
   * the other kind entirely; every built row is then checked in full by
   * {@link matchesOpportunityFilter}, so there is one definition of what each
   * criterion means.
   */
  public opportunities(filter?: OpportunityFilter): Opportunity[] {
    const rows: Opportunity[] = [];
    if (filter?.kind !== "strategy") {
      rows.push(this.poolOpportunity());
    }
    if (filter?.kind !== "pool") {
      for (const { suite, collateral } of this.strategies) {
        rows.push(suite.strategyOpportunity(collateral));
      }
    }
    return rows.filter(row => matchesOpportunityFilter(row, filter));
  }

  /**
   * Passive lending into this market's pool, as the shared read model
   * describes it.
   */
  public poolOpportunity(): PoolOpportunity {
    const { pool } = this.pool;
    const oracle = this.priceOracle;

    return {
      kind: "pool",
      chainId: this.chainId,
      pool: pool.address,
      name: this.poolName,
      curator: this.curator,
      underlyingToken: this.underlyingToken,
      // the shares are worth this much underlying at the current rate, which is
      // what makes the size comparable with the debt drawn against it
      totalSupply: oracle.toAmount(pool.underlying, pool.totalAssets),
      availableLiquidity: oracle.toAmount(
        pool.underlying,
        pool.availableLiquidity,
      ),
      totalBorrow: oracle.toAmount(pool.underlying, pool.totalBorrowed),
      utilization: pool.utilization,
      supplyApy: { organicApy: rayToBps(pool.supplyRate) },
      collateralTokens: this.collateralTokens,
      paused: pool.isPaused,
      rwa: this.rwa,
      sunset: this.sunset,
    };
  }

  /**
   * {@link poolOpportunity} plus the data only its detail screen needs.
   */
  public poolOpportunityDetail(): PoolOpportunityDetail {
    return {
      ...this.poolOpportunity(),
      rateCurve: this.pool.rateCurve,
      quotaAssets: this.quotaAssets(),
    };
  }

  /**
   * Resolves a strategy of this market by its two halves.
   *
   * @param creditManager - Credit manager the position is opened in.
   * @param collateral - Target collateral of the position.
   * @throws If this market has no such credit manager, or if that manager does
   * not accept the collateral as a strategy.
   */
  public mustFindStrategy(
    creditManager: Address,
    collateral: Address,
  ): StrategyRef {
    const strategy = this.strategies.find(
      s =>
        isAddressEqual(s.suite.creditManager.address, creditManager) &&
        isAddressEqual(s.collateral, collateral),
    );
    if (!strategy) {
      throw new Error(
        `${this.labelAddress(collateral)} is not a strategy collateral of credit manager ${this.labelAddress(creditManager)}`,
      );
    }
    return strategy;
  }

  /**
   * Detailed view of one leveraged position of this market.
   *
   * @param creditManager - Credit manager the position is opened in.
   * @param collateral - Target collateral of the position.
   * @throws If this market has no such strategy, see {@link mustFindStrategy}.
   */
  public strategyOpportunityDetail(
    creditManager: Address,
    collateral: Address,
  ): StrategyOpportunityDetail {
    return this.mustFindStrategy(
      creditManager,
      collateral,
    ).suite.strategyOpportunityDetail(collateral);
  }

  /**
   * Whether any child contract wrapper has observed events that require a
   * market resync.
   */
  override get dirty(): boolean {
    return (
      this.configurator.dirty ||
      this.pool.dirty ||
      this.priceOracle.dirty ||
      this.creditManagers.some(cm => cm.dirty)
    );
  }

  /**
   * Contract addresses whose logs are enough to detect stale market state.
   *
   * @internal
   */
  public override get watchAddresses(): Set<Address> {
    // priceOracle + pool + quota keeper + rate keeper + IRM (just in case) + loss policy + all credit triplets
    return new Set([
      this.configurator.address,
      this.state.lossPolicy.baseParams.addr,
      ...this.creditManagers.flatMap(cm => Array.from(cm.watchAddresses)),
      ...Array.from(this.priceOracle.watchAddresses),
      ...Array.from(this.pool.watchAddresses),
    ]);
  }

  /**
   * Returns a label-enriched, JSON-friendly view of the market state.
   *
   * @param raw - Whether child wrappers should keep raw numeric values when
   * applying human formatting.
   */
  public stateHuman(raw = true): MarketStateHuman {
    return {
      configurator: this.labelAddress(this.configurator.address),
      pool: this.pool.stateHuman(raw),
      creditManagers: this.creditManagers.map(cm => cm.stateHuman(raw)),
      priceOracle: this.priceOracle.stateHuman(raw),
      lossPolicy: this.lossPolicy.stateHuman(raw),
      pausableAdmins: this.state.pausableAdmins.map(a => this.labelAddress(a)),
      unpausableAdmins: this.state.unpausableAdmins.map(a =>
        this.labelAddress(a),
      ),
      emergencyLiquidators: this.state.emergencyLiquidators.map(a =>
        this.labelAddress(a),
      ),
    };
  }
}
