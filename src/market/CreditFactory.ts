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

  constructor(sdk: GearboxSDK, marketData: MarketData, index: number) {
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

    this.creditManager = new CreditManagerContract(sdk, creditManager, pool);

    this.creditFacade = new CreditFacadeContract(sdk, creditManager);

    this.creditConfigurator = new CreditConfiguratorContract(
      sdk,
      creditManager,
      emergencyLiquidators,
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
