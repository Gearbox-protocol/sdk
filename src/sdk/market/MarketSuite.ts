import type { Address } from "viem";

import type { MarketData } from "../base";
import { SDKConstruct } from "../base";
import type { GearboxSDK } from "../GearboxSDK";
import type { MarketStateHuman } from "../types";
import { CreditSuite } from "./CreditSuite";
import { MarketConfiguratorContract } from "./MarketConfiguratorContract";
import { PoolSuite } from "./PoolSuite";
import { PriceOracleV300Contract } from "./PriceOracleV300Contract";
import { PriceOracleV310Contract } from "./PriceOracleV310Contract";

export class MarketSuite extends SDKConstruct {
  public readonly acl: Address;
  public readonly configurator: MarketConfiguratorContract;
  public readonly pool: PoolSuite;
  public readonly priceOracle:
    | PriceOracleV300Contract
    | PriceOracleV310Contract;
  public readonly creditManagers: CreditSuite[] = [];
  /**
   * Original data received from compressor
   */
  public readonly state: MarketData;

  constructor(sdk: GearboxSDK, marketData: MarketData) {
    super(sdk);
    this.state = marketData;

    let configurator = sdk.contracts.get(
      marketData.configurator,
    ) as unknown as MarketConfiguratorContract;
    if (!configurator) {
      configurator = new MarketConfiguratorContract(
        sdk,
        marketData.configurator,
      );
    }
    this.configurator = configurator;

    this.acl = marketData.acl;

    for (const t of marketData.tokens) {
      sdk.tokensMeta.upsert(t.addr, t);
      sdk.provider.addressLabels.set(t.addr as Address, t.symbol);
    }

    this.pool = new PoolSuite(sdk, marketData);

    for (let i = 0; i < marketData.creditManagers.length; i++) {
      this.creditManagers.push(new CreditSuite(sdk, marketData, i));
    }

    if (marketData.priceOracleData.baseParams.version < 310) {
      this.priceOracle = new PriceOracleV300Contract(
        sdk,
        marketData.priceOracleData,
        marketData.pool.underlying,
      );
    } else {
      this.priceOracle = new PriceOracleV310Contract(
        sdk,
        marketData.priceOracleData,
        marketData.pool.underlying,
      );
    }
  }

  override get dirty(): boolean {
    return (
      this.configurator.dirty ||
      this.pool.dirty ||
      this.priceOracle.dirty ||
      this.creditManagers.some(cm => cm.dirty)
    );
  }

  public stateHuman(raw = true): MarketStateHuman {
    return {
      pool: this.pool.stateHuman(raw),
      creditManagers: this.creditManagers.map(cm => cm.stateHuman(raw)),
      priceOracle: this.priceOracle.stateHuman(raw),
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
