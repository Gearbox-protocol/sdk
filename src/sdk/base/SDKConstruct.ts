import type { Address, PublicClient } from "viem";

import type { NetworkType } from "../chain/index.js";
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

  public get networkType(): NetworkType {
    return this.sdk.networkType;
  }

  public get client(): PublicClient {
    return this.sdk.client;
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
    return this.sdk.labelAddress(address);
  }

  /**
   * Returns list of addresses that should be watched for events to sync state
   */
  public get watchAddresses(): Set<Address> {
    return new Set();
  }
}
