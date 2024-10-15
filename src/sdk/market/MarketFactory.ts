import type { Address } from "viem";

import { type MarketData, SDKConstruct } from "../base";
import type { GearboxSDK } from "../GearboxSDK";
import type { MarketStateHuman } from "../types";
import { CreditFactory } from "./CreditFactory";
import { PoolFactory } from "./PoolFactory";
import { PriceOracleContract } from "./PriceOracleContract";

export class MarketFactory extends SDKConstruct {
  public readonly riskCurator!: Address;
  public readonly poolFactory!: PoolFactory;
  public readonly priceOracle!: PriceOracleContract;
  public readonly creditManagers: CreditFactory[] = [];
  /**
   * Original data received from compressor
   */
  public readonly state: MarketData;

  constructor(sdk: GearboxSDK, marketData: MarketData) {
    super(sdk);
    this.state = marketData;
    this.riskCurator = marketData.owner;

    for (const t of marketData.tokens) {
      sdk.marketRegister.tokensMeta.upsert(t.addr, t);
      sdk.provider.addressLabels.set(t.addr as Address, t.symbol);
    }

    this.poolFactory = new PoolFactory(sdk, marketData);

    for (let i = 0; i < marketData.creditManagers.length; i++) {
      this.creditManagers.push(new CreditFactory(sdk, marketData, i));
    }

    this.priceOracle = new PriceOracleContract(
      sdk,
      marketData.priceOracleData,
      marketData.pool.underlying,
    );
  }

  override get dirty(): boolean {
    return (
      this.poolFactory.dirty ||
      this.priceOracle.dirty ||
      this.creditManagers.some(cm => cm.dirty)
    );
  }

  public stateHuman(raw = true): MarketStateHuman {
    return {
      pool: this.poolFactory.stateHuman(raw),
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
