import type { GearboxSDK } from "../GearboxSDK.js";
import type { PluginsMap } from "../plugins/index.js";
import { Construct } from "./Construct.js";

export class SDKConstruct<
  const Plugins extends PluginsMap = {},
> extends Construct {
  public readonly sdk: GearboxSDK<Plugins>;

  constructor(sdk: GearboxSDK<Plugins>) {
    super(sdk);
    this.sdk = sdk;
  }
}
