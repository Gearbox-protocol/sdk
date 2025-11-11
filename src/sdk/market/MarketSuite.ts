import type { Address } from "viem";

import type { MarketData } from "../base/index.js";
import { SDKConstruct } from "../base/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { MarketStateHuman } from "../types/index.js";
import { CreditSuite } from "./credit/index.js";
import {
  createLossPolicy,
  type ILossPolicyContract,
} from "./loss-policy/index.js";
import { MarketConfiguratorContract } from "./MarketConfiguratorContract.js";
import type { IPriceOracleContract } from "./oracle/index.js";
import { getOrCreatePriceOracle } from "./oracle/index.js";
import { PoolSuite } from "./pool/index.js";

export class MarketSuite extends SDKConstruct {
  public readonly acl: Address;
  public readonly treasury: Address;
  public readonly configurator: MarketConfiguratorContract;
  public readonly pool: PoolSuite;
  public readonly priceOracle: IPriceOracleContract;
  public readonly lossPolicy: ILossPolicyContract;
  public readonly creditManagers: CreditSuite[] = [];
  /**
   * Original data received from compressor
   */
  public readonly state: MarketData;

  constructor(sdk: GearboxSDK, marketData: MarketData) {
    super(sdk);
    this.state = marketData;

    // must be already created in MarketRegister
    const mc = sdk.contracts.mustGet(marketData.configurator);
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
      sdk.addressLabels.set(t.addr as Address, t.symbol);
    }

    this.pool = new PoolSuite(sdk, marketData);

    for (let i = 0; i < marketData.creditManagers.length; i++) {
      this.creditManagers.push(new CreditSuite(sdk, marketData, i));
    }

    this.priceOracle = getOrCreatePriceOracle(sdk, marketData.priceOracle);
    this.lossPolicy = createLossPolicy(sdk, marketData.lossPolicy);
  }

  override get dirty(): boolean {
    return (
      this.configurator.dirty ||
      this.pool.dirty ||
      this.priceOracle.dirty ||
      this.creditManagers.some(cm => cm.dirty)
    );
  }

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
