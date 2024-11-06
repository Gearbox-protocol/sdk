import type { Address } from "viem";

import type { MarketData, ZapperData } from "../base";
import { SDKConstruct } from "../base";
import type { GearboxSDK } from "../GearboxSDK";
import type { MarketStateHuman } from "../types";
import { CreditFactory } from "./CreditFactory";
import { PoolFactory } from "./PoolFactory";
import { PriceOracleV300Contract } from "./PriceOracleV300Contract";
import { PriceOracleV310Contract } from "./PriceOracleV310Contract";

export class MarketFactory extends SDKConstruct {
  public readonly acl: Address;
  public readonly riskCurator: Address;
  public readonly poolFactory: PoolFactory;
  public readonly priceOracle:
    | PriceOracleV300Contract
    | PriceOracleV310Contract;
  public readonly creditManagers: CreditFactory[] = [];
  /**
   * Original data received from compressor
   */
  public readonly state: MarketData;
  public readonly zappers: readonly ZapperData[];

  constructor(sdk: GearboxSDK, marketData: MarketData) {
    super(sdk);
    this.state = marketData;
    this.riskCurator = marketData.owner;
    this.acl = marketData.acl;

    for (const t of marketData.tokens) {
      sdk.tokensMeta.upsert(t.addr, t);
      sdk.provider.addressLabels.set(t.addr as Address, t.symbol);
    }

    this.poolFactory = new PoolFactory(sdk, marketData);
    this.zappers = marketData.zappers;

    for (let i = 0; i < marketData.creditManagers.length; i++) {
      this.creditManagers.push(new CreditFactory(sdk, marketData, i));
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
      zappers: this.zappers.map(z => ({
        address: z.baseParams.addr,
        contractType: z.baseParams.contractType,
        version: Number(z.baseParams.version),
        tokenIn: this.labelAddress(z.tokenIn),
        tokenOut: this.labelAddress(z.tokenOut),
      })),
    };
  }
}
