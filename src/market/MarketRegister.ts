import {
  ADDRESS_0X0,
  PartialRecord,
  TIMELOCK,
} from "@gearbox-protocol/sdk-gov";

import { Address } from "viem";
import { GearboxSDK } from "../SDKService";
import { CreditFactoryState } from "../state/creditState";
import { MarketState } from "../state/marketState";
import { PoolFactoryState } from "../state/poolState";
import { MarketFactory } from "./MarketFactory";
import { CreditFactory } from "../../factories/CreditFactory";

export class MarketRegister {
  protected markets: PartialRecord<string, MarketFactory> = {};

  service: GearboxSDK;

  public get state(): Array<MarketState> {
    return Object.values(this.markets).map(market => market!.state);
  }

  public get poolState(): Array<PoolFactoryState> {
    return Object.values(this.markets).map(market => market!.poolFactory.state);
  }

  public get creditManagerState(): Array<CreditFactoryState> {
    return Object.values(this.markets).flatMap(market =>
      market!.creditManagers.map(cm => cm.state),
    );
  }

  public getPoolFactories() {
    return Object.values(this.markets).map(market => market!.poolFactory);
  }

  public get creditManagers(): Array<CreditFactory> {
    return Object.values(this.markets).flatMap(
      market => market!.creditManagers,
    );
  }

  public getNewCollateralTokens(): Set<Address> {
    return new Set(
      Object.values(this.markets)
        .flatMap(market => market!.creditManagers)
        .flatMap(cm => cm!.newCollateralTokens),
    );
  }

  constructor(service: GearboxSDK) {
    this.service = service;
    // this.service.poolRegister = this;
  }

  public async loadMarkets(curators: Array<Address>) {
    const mc = this.service.marketCompressor;
    if (mc) {
      const marketsList = await mc.getMarkets({
        curators,
        pools: [],
        underlying: ADDRESS_0X0,
      });

      for (const data of marketsList) {
        this.markets[data.pool.name] = new MarketFactory(data, this.service);
      }
    } else {
      throw new Error("No MarketCompressorV3 found");
    }
  }

  public async tvl() {
    const creditManagers = this.creditManagers;
    const tvls = await Promise.all(creditManagers.map(cm => cm.tvl()));
    return tvls.reduce(
      (acc, curr) => {
        acc.tvl += curr.tvl;
        acc.tvlUSD += curr.tvlUSD;
        return acc;
      },
      { tvl: 0n, tvlUSD: 0n },
    );
  }
}
