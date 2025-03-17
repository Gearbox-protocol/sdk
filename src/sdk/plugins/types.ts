import type { BaseState, IBaseContract } from "../base/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";

export type IGearboxSDKPluginConstructor = new (
  sdk: GearboxSDK,
) => IGearboxSDKPlugin;

export interface IGearboxSDKPlugin {
  /**
   * Called after SDK is attached
   * @param sdk
   * @returns
   */
  attach?: () => Promise<void>;
  /**
   * Called after SDK state is already synced, meaning that block number and timestamp are accessible from SDK
   *
   * @param sdk
   * @returns
   */
  syncState?: () => Promise<void>;
  /**
   * Can be called by SDK to create some auxiliary contracts, such as zappers and adapters
   * @param params
   * @returns
   */
  createContract?: (params: BaseState) => IBaseContract | undefined;
  stateHuman?: (raw?: boolean) => unknown;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type PluginMap = {
  [key: string]: IGearboxSDKPluginConstructor;
};

export type PluginInstances<T extends PluginMap> = {
  [K in keyof T]: T[K] extends IGearboxSDKPluginConstructor
    ? InstanceType<T[K]>
    : never;
};
