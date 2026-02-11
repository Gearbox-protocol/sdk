import type { Address } from "viem";

import type { CreditSuiteState, MarketData } from "../../base/index.js";
import { SDKConstruct } from "../../base/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { IRouterContract } from "../../router/index.js";
import type { CreditSuiteStateHuman } from "../../types/index.js";
import createCreditConfigurator from "./createCreditConfigurator.js";
import createCreditFacade from "./createCreditFacade.js";
import createCreditManager from "./createCreditManager.js";
import type {
  CreditFacadeContract,
  ICreditConfiguratorContract,
  ICreditManagerContract,
} from "./types.js";

export class CreditSuite extends SDKConstruct {
  public readonly pool: Address;
  public readonly underlying: Address;

  public readonly creditManager: ICreditManagerContract;
  public readonly creditFacade: CreditFacadeContract;
  public readonly creditConfigurator: ICreditConfiguratorContract;
  public readonly marketConfigurator: Address;

  public readonly state: CreditSuiteState;
  public readonly name: string;

  constructor(sdk: GearboxSDK, marketData: MarketData, index: number) {
    super(sdk);
    const { creditManagers, pool } = marketData;
    this.name = creditManagers[index].creditManager.name;

    this.state = creditManagers[index];
    this.pool = pool.baseParams.addr;
    this.underlying = pool.underlying;

    this.creditManager = createCreditManager(sdk, this.state);
    this.creditFacade = createCreditFacade(sdk, this.state);
    this.creditConfigurator = createCreditConfigurator(sdk, this.state);
    this.marketConfigurator = marketData.configurator;
  }

  public get router(): IRouterContract {
    return this.sdk.routerFor(this);
  }

  public get isExpired(): boolean {
    return (
      this.creditFacade.expirable &&
      this.creditFacade.expirationDate > 0 &&
      this.creditFacade.expirationDate < this.sdk.timestamp
    );
  }

  override get dirty(): boolean {
    // TODO: any other ways to get dirty, adapters maybe?
    return (
      this.creditFacade.dirty ||
      this.creditManager.dirty ||
      this.creditConfigurator.dirty
    );
  }

  public override get watchAddresses(): Set<Address> {
    return new Set([
      this.creditConfigurator.address,
      this.creditManager.address,
      this.creditFacade.address,
    ]);
  }

  public stateHuman(raw = true): CreditSuiteStateHuman {
    return {
      isExpired: this.isExpired,
      creditFacade: this.creditFacade.stateHuman(raw),
      creditManager: this.creditManager.stateHuman(raw),
      creditConfigurator: this.creditConfigurator.stateHuman(raw),
    };
  }
}
