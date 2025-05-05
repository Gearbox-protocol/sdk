import type { Address, PublicClient } from "viem";

import type { NetworkType, Provider } from "../chain/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { PluginsMap } from "../plugins/index.js";

export class SDKConstruct<const Plugins extends PluginsMap = {}> {
  public readonly sdk: GearboxSDK<Plugins>;
  /**
   * Indicates that contract state needs to be updated
   */
  #dirty = false;

  constructor(sdk: GearboxSDK<Plugins>) {
    this.sdk = sdk;
  }

  public get provider(): Provider {
    return this.sdk.provider;
  }

  public get network(): NetworkType {
    return this.provider.networkType;
  }

  public get client(): PublicClient {
    return this.provider.publicClient;
  }

  /**
   * Indicates that contract state needs to be updated
   */
  public get dirty(): boolean {
    return this.#dirty;
  }

  protected set dirty(value: boolean) {
    this.#dirty = value;
  }

  protected labelAddress(address: Address): string {
    return this.provider.addressLabels.get(address);
  }

  /**
   * Returns list of addresses that should be watched for events to sync state
   */
  public get watchAddresses(): Set<Address> {
    return new Set();
  }
}
