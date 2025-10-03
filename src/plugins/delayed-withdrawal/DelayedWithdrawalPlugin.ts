import type { Address } from "viem";
import { iWithdrawalCompressorV310Abi } from "../../abi/IWithdrawalCompressorV310.js";
import type { IGearboxSDKPlugin } from "../../sdk/index.js";
import { AddressMap, BasePlugin } from "../../sdk/index.js";
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
    const compressor =
      this.sdk.provider.chainId === 1
        ? "0x58f1eF2680f801C0552783420b60939922676337"
        : undefined;

    this.sdk.logger?.debug(
      `loading delayed withdrawal plugin with compressor ${compressor}`,
    );

    const creditManagers = this.sdk.marketRegister.creditManagers;
    const resp = await this.provider.publicClient.multicall({
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

      if (r.status === "success") {
        this.#withdrawableAssets?.upsert(
          cm.creditManager.address,
          r.result.map(cfg => ({
            ...cfg,
            creditManager: cm.creditManager.address,
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
