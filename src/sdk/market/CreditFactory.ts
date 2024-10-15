import type { Address } from "viem";

import { type MarketData, SDKConstruct } from "../base";
import type { GearboxSDK } from "../GearboxSDK";
import type { CreditFactoryStateHuman, TVL } from "../types";
import { CreditConfiguratorContract } from "./CreditConfiguratorContract";
import { CreditFacadeV300Contract } from "./CreditFacadeV300Contract";
import { CreditFacadeV310Contract } from "./CreditFacadeV310Contract";
import { CreditManagerContract } from "./CreditManagerContract";

export class CreditFactory extends SDKConstruct {
  public readonly name: string;
  public readonly pool: Address;
  public readonly underlying: Address;
  /**
   * Mappning Token Address => Liquidation Threshold
   */
  public readonly collateralTokens: Record<Address, number>;

  public readonly creditManager: CreditManagerContract;
  public readonly creditFacade:
    | CreditFacadeV300Contract
    | CreditFacadeV310Contract;
  public readonly creditConfigurator: CreditConfiguratorContract;

  constructor(sdk: GearboxSDK, marketData: MarketData, index: number) {
    super(sdk);
    const { creditManagers, pool } = marketData;
    const creditManager = creditManagers[index];
    const { name, collateralTokens, liquidationThresholds } =
      creditManager.creditManager;

    this.name = name;
    this.pool = pool.baseParams.addr;
    this.underlying = pool.underlying;
    this.collateralTokens = Object.fromEntries(
      collateralTokens.map((t, i) => [t, liquidationThresholds[i]]),
    );

    this.creditManager = new CreditManagerContract(sdk, creditManager);

    if (creditManager.creditFacade.baseParams.version < 310) {
      this.creditFacade = new CreditFacadeV300Contract(sdk, creditManager);
    } else {
      this.creditFacade = new CreditFacadeV310Contract(sdk, creditManager);
    }

    this.creditConfigurator = new CreditConfiguratorContract(
      sdk,
      creditManager,
    );
  }

  async tvl(): Promise<TVL> {
    // const cas =
    //   await this.service.peripheryFactory.dataCompressorV3Contract.getCreditsAccountByCreditManager(
    //     this.creditManager.address,
    //   );
    const tvl = 0n; // cas.reduce((acc, ca) => acc + BigInt(ca.totalValue), 0n);
    const tvlUSD = 0n; // cas.reduce((acc, ca) => acc + BigInt(ca.totalValueUSD), 0n);
    return { tvl, tvlUSD };
  }

  override get dirty(): boolean {
    // TODO: any other ways to get dirty, adapters maybe?
    return (
      this.creditFacade.dirty ||
      this.creditManager.dirty ||
      this.creditConfigurator.dirty
    );
  }

  public stateHuman(raw = true): CreditFactoryStateHuman {
    return {
      creditFacade: this.creditFacade.stateHuman(raw),
      creditManager: this.creditManager.stateHuman(raw),
      creditConfigurator: this.creditConfigurator.stateHuman(raw),
    };
  }
}
