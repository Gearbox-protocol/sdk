import type { Address } from "@gearbox-protocol/sdk-gov";

import { CreditFactory } from "../../factories/CreditFactory";
import { PoolFactory } from "../../factories/PoolFactory";
import type { MarketDataStruct } from "../base/types";
import type { GearboxSDK } from "../SDKService";
import type { MarketState } from "../state/marketState";
import { PriceFeedFactory } from "./PriceFeedFactory";

export class MarketFactory {
  riskCurator: Address;

  public poolFactory: PoolFactory;

  protected priceFeedFactory: PriceFeedFactory;
  public creditManagers: Array<CreditFactory> = [];

  public get state(): MarketState {
    return {
      pool: this.poolFactory.state,
      creditManagers: this.creditManagers.map(cm => cm.state),
      priceOracle: this.priceFeedFactory.state,
    };
  }

  constructor(marketData: MarketDataStruct, service: GearboxSDK) {
    this.poolFactory = PoolFactory.attachMarket(marketData, service);

    for (let i = 0; i < marketData.creditManagers.length; i++) {
      this.creditManagers.push(
        CreditFactory.attachMarket(marketData, i, service),
      );
    }

    this.priceFeedFactory = PriceFeedFactory.attachMarket(marketData, service);

    for (const t of marketData.tokens) {
      service.provider.addressLabels.set(t.addr as Address, t.symbol);
    }
  }
}
