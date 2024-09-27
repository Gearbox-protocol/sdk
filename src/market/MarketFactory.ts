import type { Address } from "viem";

import type { MarketData } from "../base";
import type { GearboxSDK } from "../GearboxSDK";
import type { MarketState } from "../state";
import { CreditFactory } from "./CreditFactory";
import { PoolFactory } from "./PoolFactory";
import { PriceFeedFactory } from "./PriceFeedFactory";

export class MarketFactory {
  public readonly riskCurator: Address;
  public readonly poolFactory: PoolFactory;
  public readonly priceFeedFactory: PriceFeedFactory;
  public readonly creditManagers: CreditFactory[] = [];

  constructor(marketData: MarketData, sdk: GearboxSDK) {
    this.riskCurator = marketData.owner;
    this.poolFactory = new PoolFactory(marketData, sdk);

    for (let i = 0; i < marketData.creditManagers.length; i++) {
      this.creditManagers.push(new CreditFactory(marketData, i, sdk));
    }

    this.priceFeedFactory = PriceFeedFactory.attachMarket(marketData, sdk);

    for (const t of marketData.tokens) {
      sdk.provider.addressLabels.set(t.addr as Address, t.symbol);
    }
  }

  public get state(): MarketState {
    return {
      pool: this.poolFactory.state,
      creditManagers: this.creditManagers.map(cm => cm.state),
      priceOracle: this.priceFeedFactory.state,
    };
  }
}
