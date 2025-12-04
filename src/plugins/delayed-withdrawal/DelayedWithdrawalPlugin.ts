import type { Address } from "viem";
import { iWithdrawalCompressorV310Abi } from "../../abi/IWithdrawalCompressorV310.js";
import type { IGearboxSDKPlugin } from "../../sdk/index.js";
import {
  AddressMap,
  BasePlugin,
  getWithdrawalCompressorAddress,
} from "../../sdk/index.js";
import type {
  WithdrawableAsset,
  WithdrawableAssetStateHuman,
} from "./types.js";

export interface DelayedWithdrawalPluginState {
  withdrawableAssets: Record<Address, Array<WithdrawableAsset>>;
}

const MAP_LABEL = "delayedWithdrawal";

export class DelayedWithdrawalPlugin
  extends BasePlugin<DelayedWithdrawalPluginState>
  implements IGearboxSDKPlugin<DelayedWithdrawalPluginState>
{
  #withdrawableAssets?: AddressMap<Array<WithdrawableAsset>>;

  public async load(force?: boolean): Promise<DelayedWithdrawalPluginState> {
    if (!force && this.loaded) {
      return this.state;
    }

    // TODO: load from address provider
    // const [pcAddr] = this.sdk.addressProvider.mustGetLatest(
    //   AP_PERIPHERY_COMPRESSOR,
    //   VERSION_RANGE_310,
    // );
    const compressor = getWithdrawalCompressorAddress(this.sdk.chainId);

    this.sdk.logger?.debug(
      `loading delayed withdrawal plugin with compressor ${compressor}`,
    );

    const creditManagers = this.sdk.marketRegister.creditManagers;
    const resp = await this.client.multicall({
      contracts: compressor
        ? creditManagers.map(
            cm =>
              ({
                abi: iWithdrawalCompressorV310Abi,
                address: compressor,
                functionName: "getWithdrawableAssets",
                args: [cm.creditManager.address],
              }) as const,
          )
        : [],
      allowFailure: true,
    });

    this.#withdrawableAssets = new AddressMap(undefined, MAP_LABEL);
    resp.forEach((r, index) => {
      const cm = creditManagers[index];

      if (r.status === "success" && r.result?.length > 0) {
        const configsToShow = r.result;

        this.#withdrawableAssets?.upsert(
          cm.creditManager.address,
          configsToShow.map(cfg => ({
            ...cfg,
            creditManager: cm.creditManager.address,
            disabled: isConfigToOmit({
              creditManager: cm.creditManager.address,
              token: cfg.token,
              withdrawalPhantomToken: cfg.withdrawalPhantomToken,
              underlying: cfg.underlying,
            }),
          })),
        );
      } else {
        // this.sdk.logger?.error(
        //   `failed to load delayed assets for cm ${this.labelAddress(
        //     cm.creditManager.address,
        //   )}: ${r.error}`,
        // );
      }
    });

    return this.state;
  }

  public get loaded(): boolean {
    return !!this.#withdrawableAssets;
  }

  /**
   * Returns a map of cmAddress -> array of delayed assets
   * @throws if plugin is not attached
   */
  public get withdrawableAssets(): AddressMap<Array<WithdrawableAsset>> {
    if (!this.#withdrawableAssets) {
      throw new Error("withdrawable assets plugin not attached");
    }
    return this.#withdrawableAssets;
  }

  public stateHuman(_?: boolean): WithdrawableAssetStateHuman[] {
    return this.withdrawableAssets.values().flatMap(cm => {
      const cmAssets = cm.map((a): WithdrawableAssetStateHuman => {
        return {
          address: a.creditManager,
          version: this.version,
          ...a,
        };
      });
      return cmAssets;
    });
  }

  public get state(): DelayedWithdrawalPluginState {
    return {
      withdrawableAssets: this.withdrawableAssets.asRecord(),
    };
  }

  public hydrate(state: DelayedWithdrawalPluginState): void {
    this.#withdrawableAssets = new AddressMap(
      Object.entries(state.withdrawableAssets),
      MAP_LABEL,
    );
  }
}

interface ConfigToOmit {
  creditManager: Address;
  token: Address;
  withdrawalPhantomToken: Address;
  underlying: Address;
}

function getConfigKey(config: ConfigToOmit): string {
  return `${config.creditManager}-${config.token}-${config.withdrawalPhantomToken}-${config.underlying}`.toLowerCase();
}

function isConfigToOmit(config: ConfigToOmit): boolean {
  return !!CONFIGS_TO_OMIT_RECORD[getConfigKey(config)];
}

const CONFIGS_TO_OMIT_LIST: Array<ConfigToOmit> = [
  {
    // checked
    creditManager: "0xf5edc34204e67e592bdcb84114571c9e4bd0bdf7",
    token: "0x7a4EffD87C2f3C55CA251080b1343b605f327E3a",
    withdrawalPhantomToken: "0x6252467C2FefB61cB55180282943139BAeEA36c5",
    underlying: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
  },
  {
    // checked
    creditManager: "0xb79d6544839d169869476589d2e54014a074317b",
    token: "0x7a4EffD87C2f3C55CA251080b1343b605f327E3a",
    withdrawalPhantomToken: "0x6252467C2FefB61cB55180282943139BAeEA36c5",
    underlying: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
  },
  {
    // checked
    creditManager: "0x79c6c1ce5b12abcc3e407ce8c160ee1160250921",
    token: "0x7a4EffD87C2f3C55CA251080b1343b605f327E3a",
    withdrawalPhantomToken: "0x6252467C2FefB61cB55180282943139BAeEA36c5",
    underlying: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
  },
  {
    // checked
    creditManager: "0xc307a074bd5aec2d6ad1d9b74465c24a59b490fd",
    token: "0x7a4EffD87C2f3C55CA251080b1343b605f327E3a",
    withdrawalPhantomToken: "0x6252467C2FefB61cB55180282943139BAeEA36c5",
    underlying: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
  },

  {
    // zero debt limit + no opened positions
    creditManager: "0x9a0fdf7cdab4604fc27ebeab4b3d57bd825e8ebe",
    token: "0x7a4EffD87C2f3C55CA251080b1343b605f327E3a",
    withdrawalPhantomToken: "0x6252467C2FefB61cB55180282943139BAeEA36c5",
    underlying: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
  },

  {
    // cant load
    creditManager: "0x06c0df5ac1f24bc2097b59ed8ee1db86bf0b09df",
    token: "0x7a4EffD87C2f3C55CA251080b1343b605f327E3a",
    withdrawalPhantomToken: "0x6252467C2FefB61cB55180282943139BAeEA36c5",
    underlying: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
  },
  {
    // cant load
    creditManager: "0x1128860755c6d452d9326e35d1672ca7c920b7c1",
    token: "0x7a4EffD87C2f3C55CA251080b1343b605f327E3a",
    withdrawalPhantomToken: "0x6252467C2FefB61cB55180282943139BAeEA36c5",
    underlying: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
  },
  {
    // cant load
    creditManager: "0x35e154be3c856c37d539aae90178fe5ac6d37644",
    token: "0x7a4EffD87C2f3C55CA251080b1343b605f327E3a",
    withdrawalPhantomToken: "0x6252467C2FefB61cB55180282943139BAeEA36c5",
    underlying: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
  },
];
const CONFIGS_TO_OMIT_RECORD = CONFIGS_TO_OMIT_LIST.reduce<
  Record<string, ConfigToOmit>
>((acc, config) => {
  acc[getConfigKey(config)] = config;
  return acc;
}, {});
