import { type Address, isAddressEqual } from "viem";

import type {
  Curator,
  Opportunity,
  OpportunityFilter,
  PoolOpportunity,
  PoolOpportunityDetail,
  PriceFeedSummary,
  QuotaAsset,
  Token,
  TokenAmount,
  UnderlyingToken,
} from "../../model/index.js";
import { isFilterSet, matchesOpportunityFilter } from "../../model/index.js";
import { type Asset, type MarketData, SDKConstruct } from "../base/index.js";
import { isRWAToken, isSunsetPool } from "../chain/chains.js";
import { DUST_THRESHOLD } from "../constants/index.js";
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
 * Oracle estimate of a bag of holdings in this market's underlying.
 *
 * Tokens the oracle cannot price contribute `0` and are named on
 * {@link unpriceable} (the first miss). Callers that speak preview errors map
 * that address to `ERROR_UNPRICEABLE_TOKEN` themselves.
 **/
export interface ValueInUnderlying {
  /**
   * Sum of converted balances, in the pool underlying's decimals.
   **/
  value: bigint;
  /**
   * First token with no price; omitted if every entry converted.
   **/
  unpriceable?: Address;
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
   * Underlying token of the market pool, as returned by contract.
   * For RWA markets this is a wrapped token (e.g. dcUSDC, rather than USDC)
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
   * wrapper itself, e.g. USDC rather than dcUSDC (which will be "wrappedAddress" in this case)
   */
  public get underlyingToken(): UnderlyingToken {
    return {
      ...this.tokensMeta.mustGetToken(this.unwrappedUnderlying),
      wrappedAddress: isAddressEqual(this.underlying, this.unwrappedUnderlying)
        ? null
        : this.underlying,
    };
  }

  /**
   * Whether `token` is this market's pool underlying or the asset it wraps
   * (dcUSDC or USDC on an RWA pool). Amounts in either unit are 1:1 with the
   * figure {@link toUnderlyingAmount} reports.
   */
  public isUnderlyingLike(token: Address): boolean {
    return (
      isAddressEqual(token, this.underlying) ||
      isAddressEqual(token, this.unwrappedUnderlying)
    );
  }

  /**
   * Prices a figure already denominated in this market's underlying — a debt,
   * a TVL, a payout — as the read model reports one.
   *
   * The token it names is {@link underlyingToken}, so an amount coming out of a
   * preview or a simulation carries the same identity as the one on a
   * `StrategyPosition`: USDC on an RWA market, not the dcUSDC wrapper the pool
   * actually holds. The two convert one-for-one, so the figure is exact either
   * way; only the label differs, and a caller showing both side by side must
   * not see two.
   **/
  public toUnderlyingAmount = (value: bigint): TokenAmount => ({
    token: this.underlyingToken,
    ...this.priceOracle.toAmount(this.underlying, value),
  });

  /**
   * Sums `assets` in this market's underlying at latest oracle prices.
   *
   * Balances at or below `minBalance` are ignored. A token the oracle cannot
   * price contributes nothing; the first such token is {@link ValueInUnderlying.unpriceable}.
   *
   * The counterpart of {@link toUnderlyingAmount}: that method labels a figure
   * already in underlying, this one produces the figure from mixed holdings.
   **/
  public valueInUnderlying(
    assets: Asset[],
    minBalance: bigint = DUST_THRESHOLD,
  ): ValueInUnderlying {
    let unpriceable: Address | undefined;
    let value = 0n;
    for (const { token, balance } of assets) {
      if (balance <= minBalance) {
        continue;
      }
      const converted = this.priceOracle.safeConvert(
        token,
        this.underlying,
        balance,
      );
      if (converted === null) {
        unpriceable ??= token;
        continue;
      }
      value += converted;
    }
    return unpriceable === undefined ? { value } : { value, unpriceable };
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
   * Tokens a user can transfer from their wallet to deposit into this pool.
   *
   * 1. unwrapped underlying
   * 2. tokenIn of every zapper (order does not matter), skipping the wrapped
   *    and unwrapped underlying
   */
  public get allowedDepositTokens(): Token[] {
    const seen = new AddressMap<Token>(undefined, "allowedDepositTokens");
    seen.upsert(this.unwrappedUnderlying, this.underlyingToken);
    for (const zapper of this.sdk.marketRegister.poolZappers(
      this.pool.pool.address,
    )) {
      const tokenIn = zapper.tokenIn.addr;
      if (this.isUnderlyingLike(tokenIn)) {
        continue;
      }
      seen.upsert(tokenIn, this.tokensMeta.mustGetToken(tokenIn));
    }
    return seen.values();
  }

  /**
   * Whether one of the market's quoted tokens is a real-world-asset token.
   * Read from a hardcoded per-chain list rather than from the chain.
   */
  public get rwa(): boolean {
    return this.pool.pqk.quotas
      .keys()
      .some(token => isRWAToken(token, this.sdk.networkType));
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
    const quotas = this.pool.pqk.quotas.entries();

    return quotas.map(([token, quota]) => ({
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
   * Every opportunity this market offers: its pool, plus one row per credit
   * manager that qualifies as a strategy.
   *
   * @param filter - Optional narrowing. A filter naming a kind skips building
   * the other kind entirely; every built row is then checked in full by
   * {@link matchesOpportunityFilter}, so there is one definition of what each
   * condition means.
   */
  public opportunities(filter?: OpportunityFilter): Opportunity[] {
    const rows: Opportunity[] = [];
    const kind = filter?.kind;
    if (!isFilterSet(kind) || kind === "pool") {
      rows.push(this.poolOpportunity());
    }
    if (!isFilterSet(kind) || kind === "strategy") {
      for (const suite of this.creditManagers) {
        const opportunity = suite.strategyOpportunity();
        if (opportunity) {
          rows.push(opportunity);
        }
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
      // deposits plus accrued interest, comparable with borrowed-with-interest
      totalSupply: oracle.toAmount(pool.underlying, pool.expectedLiquidity),
      availableLiquidity: oracle.toAmount(
        pool.underlying,
        pool.availableLiquidity,
      ),
      totalBorrowedWithInterest: oracle.toAmount(
        pool.underlying,
        pool.borrowed,
      ),
      supplyApy: { organicApy: rayToBps(pool.supplyRate) },
      allowedDepositTokens: this.allowedDepositTokens,
      paused: pool.isPaused,
      rwa: this.rwa,
      sunset: this.sunset,
      quotaAssets: this.quotaAssets(),
    };
  }

  /**
   * {@link poolOpportunity} plus the data only its detail screen needs.
   */
  public poolOpportunityDetail(): PoolOpportunityDetail {
    return {
      ...this.poolOpportunity(),
      rateCurve: this.pool.rateCurve,
    };
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
