import type { OnchainSDK } from "../OnchainSDK.js";
import type { PluginsMap } from "../plugins/index.js";
import { Construct } from "./Construct.js";

/**
 * @internal
 * Extended base class for SDK components that need a reference to the
 * top-level {@link OnchainSDK} instance (and its plugins).
 *
 * Prefer this over {@link Construct} when the component accesses SDK-level
 * services such as market registers, plugins, or hooks.
 *
 * @typeParam Plugins - Map of attached plugin types.
 */
export class SDKConstruct<
  const Plugins extends PluginsMap = {},
> extends Construct {
  public readonly sdk: OnchainSDK<Plugins>;

  constructor(sdk: OnchainSDK<Plugins>) {
    super({ register: sdk });
    this.sdk = sdk;
  }
}
