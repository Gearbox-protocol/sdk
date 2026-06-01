import type { Address } from "viem";

import type { MarketData } from "../base/index.js";
import { SDKConstruct } from "../base/index.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import type { MarketStateHuman } from "../types/index.js";
import { CreditSuite } from "./credit/index.js";
import {
  createLossPolicy,
  type ILossPolicyContract,
} from "./loss-policy/index.js";
import { MarketConfiguratorContract } from "./MarketConfiguratorContract.js";
import type { IPriceOracleContract } from "./oracle/index.js";
import { createPriceOracle } from "./oracle/index.js";
import { PoolSuite } from "./pool/index.js";
import type { IRWAFactory } from "./rwa/types.js";

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
