import type { Address } from "viem";

import type {
  CreditAccountData,
  GetCreditAccountsOptions,
  IGearboxSDKPlugin,
} from "../../sdk/index.js";
import {
  AddressMap,
  BasePlugin,
  createCreditAccountService,
} from "../../sdk/index.js";

export interface AccountsPluginState {
  /**
   * All credit accounts
   */
  accounts: CreditAccountData[];
}

export class AccountsPlugin
  extends BasePlugin<AccountsPluginState>
  implements IGearboxSDKPlugin<AccountsPluginState>
{
  #accounts?: CreditAccountData[];
  #byCreditManager?: AddressMap<CreditAccountData[]>;
  #byPool?: AddressMap<CreditAccountData[]>;
  #options: GetCreditAccountsOptions;

  constructor(options: GetCreditAccountsOptions = {}, loadOnAttach = true) {
    super(loadOnAttach);
    this.#options = options;
  }

  public get accounts(): CreditAccountData[] {
    if (!this.#accounts) {
      throw new Error("AccountsPlugin is not loaded");
    }
    return this.#accounts;
  }

  public get loaded(): boolean {
    return !!this.#accounts;
  }

  public byCreditManager(creditManager: Address): CreditAccountData[] {
    return this.#byCreditManager?.get(creditManager) ?? [];
  }

  public byPool(pool: Address): CreditAccountData[] {
    return this.#byPool?.get(pool) ?? [];
  }

  public async load(force?: boolean): Promise<AccountsPluginState> {
    if (!force && this.loaded) {
      return this.state;
    }
    const service = createCreditAccountService(this.sdk, 310);
    const accounts = await service.getCreditAccounts(
      this.#options,
      this.sdk.currentBlock,
    );
    this.#setAccounts(accounts);
    return this.state;
  }

  public get state(): AccountsPluginState {
    return {
      accounts: this.accounts,
    };
  }

  public hydrate(state: AccountsPluginState): void {
    this.#setAccounts(state.accounts);
  }

  #setAccounts(accounts: CreditAccountData[]): void {
    this.#accounts = accounts;
    this.#byCreditManager = new AddressMap();
    this.#byPool = new AddressMap();
    for (const a of accounts) {
      const { creditManager } = a;
      const cmAccounts = this.#byCreditManager.get(creditManager) ?? [];
      this.#byCreditManager.upsert(creditManager, [...cmAccounts, a]);

      const pool =
        this.sdk.marketRegister.findByCreditManager(creditManager).pool.pool
          .address;
      const poolAccounts = this.#byPool.get(pool) ?? [];
      this.#byPool.upsert(pool, [...poolAccounts, a]);
    }
  }
}
