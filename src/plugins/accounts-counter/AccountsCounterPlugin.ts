import type { Address } from "viem";
import { creditAccountCompressorAbi } from "../../abi/compressors/creditAccountCompressor.js";
import type { IGearboxSDKPlugin } from "../../sdk/index.js";
import {
  ADDRESS_0X0,
  AddressMap,
  AP_CREDIT_ACCOUNT_COMPRESSOR,
  BasePlugin,
  MAX_UINT256,
  TypedObjectUtils,
  VERSION_RANGE_310,
} from "../../sdk/index.js";

export interface AccountsCounterPluginState {
  /**
   * Mapping of credit manager addresses to the number of accounts
   */
  accounts: Record<Address, bigint>;
}

export class AccountsCounterPlugin
  extends BasePlugin<AccountsCounterPluginState>
  implements IGearboxSDKPlugin<AccountsCounterPluginState>
{
  #accounts?: AddressMap<bigint>;

  constructor(loadOnAttach = true) {
    super(loadOnAttach);
  }

  public get accounts(): AddressMap<bigint> {
    if (!this.#accounts) {
      throw new Error("AccountsCounterPlugin is not loaded");
    }
    return this.#accounts;
  }

  public get loaded(): boolean {
    return !!this.#accounts;
  }

  public forCreditManager(addr: Address): bigint {
    return this.accounts.mustGet(addr);
  }

  public async load(force?: boolean): Promise<AccountsCounterPluginState> {
    if (!force && this.loaded) {
      return this.state;
    }
    const [compressor] = this.sdk.addressProvider.mustGetLatest(
      AP_CREDIT_ACCOUNT_COMPRESSOR,
      VERSION_RANGE_310,
    );
    const cms = this.sdk.marketRegister.creditManagers;
    const count = await this.sdk.client.multicall({
      contracts: cms.flatMap(
        cm =>
          [
            {
              abi: creditAccountCompressorAbi,
              address: compressor,
              functionName: "countCreditAccounts",
              args: [
                cm.creditManager.address,
                {
                  owner: ADDRESS_0X0,
                  includeZeroDebt: false,
                  maxHealthFactor: MAX_UINT256,
                  minHealthFactor: 0n,
                  reverting: false,
                },
              ],
            },
            {
              abi: creditAccountCompressorAbi,
              address: compressor,
              functionName: "countCreditAccounts",
              args: [
                cm.creditManager.address,
                {
                  owner: ADDRESS_0X0,
                  includeZeroDebt: false,
                  maxHealthFactor: MAX_UINT256,
                  minHealthFactor: 0n,
                  reverting: true,
                },
              ],
            },
          ] as const,
      ),
      allowFailure: false,
      batchSize: 0,
    });
    this.#accounts = new AddressMap();
    for (let i = 0; i < cms.length; i++) {
      const cm = cms[i];
      const [reverting, nonReverting] = [count[2 * i], count[2 * i + 1]];
      this.#accounts.upsert(cm.creditManager.address, reverting + nonReverting);
    }
    return this.state;
  }

  public get state(): AccountsCounterPluginState {
    return {
      accounts: this.accounts.asRecord(),
    };
  }

  public hydrate(state: AccountsCounterPluginState): void {
    this.#accounts = new AddressMap();
    for (const [addr, count] of TypedObjectUtils.entries(state.accounts)) {
      this.accounts.upsert(addr, count);
    }
  }
}
