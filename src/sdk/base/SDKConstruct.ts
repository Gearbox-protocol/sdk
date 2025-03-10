import type { Address } from "viem";

import type { Provider } from "../chain/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";

export class SDKConstruct {
  public readonly sdk: GearboxSDK;
  /**
   * Indicates that contract state needs to be updated
   */
  #dirty = false;

  constructor(sdk: GearboxSDK) {
    this.sdk = sdk;
  }

  public get provider(): Provider {
    return this.sdk.provider;
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
}
