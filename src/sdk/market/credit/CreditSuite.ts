import type { Address } from "viem";

import { type MarketData, SDKConstruct } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import type { CreditSuiteStateHuman, TVL } from "../../types";
import createCreditConfigurator from "./createCreditConfigurator";
import createCreditFacade from "./createCreditFacade";
import createCreditManager from "./createCreditManager";
import type {
  CreditFacadeContract,
  ICreditConfiguratorContract,
  ICreditManagerContract,
} from "./types";

export class CreditSuite extends SDKConstruct {
  public readonly name: string;
  public readonly pool: Address;
  public readonly underlying: Address;

  public readonly creditManager: ICreditManagerContract;
  public readonly creditFacade: CreditFacadeContract;
  public readonly creditConfigurator: ICreditConfiguratorContract;

  constructor(sdk: GearboxSDK, marketData: MarketData, index: number) {
    super(sdk);
    const { creditManagers, pool } = marketData;
    const creditManager = creditManagers[index];
    const { name } = creditManager.creditManager;

    this.name = name;
    this.pool = pool.baseParams.addr;
    this.underlying = pool.underlying;

    this.creditManager = createCreditManager(sdk, creditManager);
    this.creditFacade = createCreditFacade(sdk, creditManager);
    this.creditConfigurator = createCreditConfigurator(sdk, creditManager);
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

  public stateHuman(raw = true): CreditSuiteStateHuman {
    return {
      creditFacade: this.creditFacade.stateHuman(raw),
      creditManager: this.creditManager.stateHuman(raw),
      creditConfigurator: this.creditConfigurator.stateHuman(raw),
    };
  }
}
