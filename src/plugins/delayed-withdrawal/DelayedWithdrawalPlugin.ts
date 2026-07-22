import type { Address } from "viem";
import type { IOnchainSDKPlugin } from "../../sdk/index.js";
import { AddressMap, BasePlugin } from "../../sdk/index.js";
import type {
  WithdrawableAsset,
  WithdrawableAssetStateHuman,
} from "./types.js";

/**
 * The plugin holds no state of its own: withdrawable assets are cached
 * (and serialized/hydrated) by the withdrawal compressor contract in the
 * core SDK state (`GearboxState.withdrawals`).
 **/
export type DelayedWithdrawalPluginState = Record<string, never>;

const MAP_LABEL = "delayedWithdrawal";

export class DelayedWithdrawalPlugin
  extends BasePlugin<DelayedWithdrawalPluginState>
  implements IOnchainSDKPlugin<DelayedWithdrawalPluginState>
{
  public async load(force?: boolean): Promise<DelayedWithdrawalPluginState> {
    if (!force && this.loaded) {
      return this.state;
    }
    // no-op on chains without a withdrawal compressor
    await this.sdk.withdrawalCompressor?.loadWithdrawableAssets(force);
    return this.state;
  }

  public get loaded(): boolean {
    return !!this.sdk.withdrawalCompressor?.state;
  }

  /**
   * Returns a map of cmAddress -> array of delayed assets
   * @throws if withdrawable assets have not been loaded
   */
  public get withdrawableAssets(): AddressMap<Array<WithdrawableAsset>> {
    const compressor = this.sdk.withdrawalCompressor;
    if (!compressor?.state) {
      throw new Error("withdrawable assets are not loaded");
    }
    const result = new AddressMap<Array<WithdrawableAsset>>(
      undefined,
      MAP_LABEL,
    );
    for (const cfg of compressor.getWithdrawableAssets()) {
      const assets = result.get(cfg.creditManager) ?? [];
      assets.push({
        ...cfg,
        disabled: isConfigToOmit({
          creditManager: cfg.creditManager,
          token: cfg.token,
          withdrawalPhantomToken: cfg.withdrawalPhantomToken,
          underlying: cfg.underlying,
        }),
      });
      result.upsert(cfg.creditManager, assets);
    }
    return result;
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
    return {};
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
