import type { Address } from "viem";

import { iCreditAccountCompressorAbi } from "../abi/compressors.js";
import type { IGearboxSDKPlugin, IPluginState } from "../sdk/index.js";
import {
  ADDRESS_0X0,
  AddressMap,
  AP_CREDIT_ACCOUNT_COMPRESSOR,
  MAX_UINT256,
  SDKConstruct,
  TypedObjectUtils,
  VERSION_RANGE_310,
} from "../sdk/index.js";

export interface AccountsCounterPluginState extends IPluginState {
  /**
   * Mapping of credit manager addresses to the number of accounts
   */
  accounts: Record<Address, bigint>;
}

export class AccountsCounterPlugin
  extends SDKConstruct
  implements IGearboxSDKPlugin<AccountsCounterPluginState>
{
  readonly #accounts: AddressMap<bigint> = new AddressMap();

  public readonly version = 1;

  public async attach(): Promise<void> {
    await this.#load();
  }

  public async syncState(): Promise<void> {
    await this.#load();
  }

  public get accounts(): AddressMap<bigint> {
    return this.#accounts;
  }

  public forCreditManager(addr: Address): bigint {
    return this.#accounts.mustGet(addr);
  }

  async #load(): Promise<void> {
    const [compressor] = this.sdk.addressProvider.mustGetLatest(
      AP_CREDIT_ACCOUNT_COMPRESSOR,
      VERSION_RANGE_310,
    );
    const cms = this.sdk.marketRegister.creditManagers;
    const count = await this.sdk.provider.publicClient.multicall({
      contracts: cms.flatMap(
        cm =>
          [
            {
              abi: iCreditAccountCompressorAbi,
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
              abi: iCreditAccountCompressorAbi,
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
    });
    this.#accounts.clear();
    for (let i = 0; i < cms.length; i++) {
      const cm = cms[i];
      const [reverting, nonReverting] = [count[2 * i], count[2 * i + 1]];
      this.#accounts.upsert(cm.creditManager.address, reverting + nonReverting);
    }
  }

  public get state(): AccountsCounterPluginState {
    return {
      version: this.version,
      accounts: this.#accounts.asRecord(),
    };
  }

  public hydrate(state: AccountsCounterPluginState): void {
    this.#accounts.clear();
    for (const [addr, count] of TypedObjectUtils.entries(state.accounts)) {
      this.#accounts.upsert(addr, count);
    }
  }
}
