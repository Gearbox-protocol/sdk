import type { Address } from "viem";

import { type MarketData, SDKConstruct } from "../base";
import type { GearboxSDK } from "../GearboxSDK";
import type { MarketState } from "../state";
import { CreditFactory } from "./CreditFactory";
import { PoolFactory } from "./PoolFactory";
import { PriceOracleContract } from "./PriceOracleContract";

export class MarketFactory extends SDKConstruct {
  public readonly riskCurator!: Address;
  public readonly poolFactory!: PoolFactory;
  public readonly priceOracle!: PriceOracleContract;
  public readonly creditManagers: CreditFactory[] = [];

  constructor(sdk: GearboxSDK, marketData: MarketData) {
    super(sdk);
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

  public get state(): MarketState {
    return {
      pool: this.poolFactory.state,
      creditManagers: this.creditManagers.map(cm => cm.state),
      priceOracle: this.priceOracle.state,
    };
  }
}
