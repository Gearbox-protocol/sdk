import type { Address } from "viem";

import type { MarketData } from "../base";
import type { GearboxSDK } from "../GearboxSDK";
import type { CreditFactoryState } from "../state";
import { CreditConfiguratorContract } from "./CreditConfiguratorContract";
import { CreditFacadeContract } from "./CreditFacadeContract";
import { CreditManagerContract } from "./CreditManagerContract";

export class CreditFactory {
  public readonly name: string;
  public readonly pool: Address;
  public readonly underlying: Address;
  /**
   * Mappning Token Address => Liquidation Threshold
   */
  public readonly collateralTokens: Record<Address, number>;

  public readonly creditManager: CreditManagerContract;
  public readonly creditFacade: CreditFacadeContract;
  public readonly creditConfigurator: CreditConfiguratorContract;

  // TODO:
  // adapterFactory: AdapterFactory;

  constructor(marketData: MarketData, index: number, sdk: GearboxSDK) {
    const { creditManagers, pool, emergencyLiquidators } = marketData;
    const creditManager = creditManagers[index];
    const { name, collateralTokens, liquidationThresholds } =
      creditManager.creditManager;

    this.name = name;
    this.pool = pool.baseParams.addr;
    this.underlying = pool.underlying;
    this.collateralTokens = Object.fromEntries(
      collateralTokens.map((t, i) => [t, liquidationThresholds[i]]),
    );

    this.creditManager = new CreditManagerContract(creditManager, pool, sdk);

    this.creditFacade = new CreditFacadeContract(creditManager, sdk);

    this.creditConfigurator = new CreditConfiguratorContract(
      creditManager,
      emergencyLiquidators,
      sdk,
    );

    // TODO:
    // this.adapterFactory = AdapterFactory.attachMarket(
    //   marketData,
    //   index,
    //   service,
    // );
  }

  public get state(): CreditFactoryState {
    return {
      creditFacade: this.creditFacade.state,
      creditManager: this.creditManager.state,
      creditConfigurator: this.creditConfigurator.state,
      // TODO:
      // adapters: this.adapterFactory.state,
      adapters: [],
    };
  }
}
