import type { Address } from "viem";

import type { MarketData } from "../base/index.js";
import { SDKConstruct } from "../base/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { MarketStateHuman } from "../types/index.js";
import { CreditSuite } from "./credit/index.js";
import { MarketConfiguratorContract } from "./MarketConfiguratorContract.js";
import type { PriceOracleContract } from "./oracle/index.js";
import { createPriceOracle } from "./oracle/index.js";
import { PoolSuite } from "./pool/index.js";

export class MarketSuite extends SDKConstruct {
  public readonly acl: Address;
  public readonly configurator: MarketConfiguratorContract;
  public readonly pool: PoolSuite;
  public readonly priceOracle: PriceOracleContract;
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

    this.priceOracle = createPriceOracle(
      sdk,
      marketData.priceOracleData,
      marketData.pool.underlying,
    );
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
      configurator: this.labelAddress(this.configurator.address),
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
