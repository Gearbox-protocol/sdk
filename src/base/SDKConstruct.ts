import type { Provider } from "../chain";
import type { GearboxSDK } from "../GearboxSDK";

export class SDKConstruct {
  public readonly sdk: GearboxSDK;

  constructor(sdk: GearboxSDK) {
    this.sdk = sdk;
  }

  public get provider(): Provider {
    return this.sdk.provider;
  }
}
